import logging
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Query
from typing import List
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from starlette.middleware.cors import ALL_METHODS
from classes import ReviewMinimalDTO, Beer, SurveyBeerDTO, ComparisonSubmission, MatchupResponse
from recommender import (
    addDiversity, getPopularBeers, loadData, loadSurveyBeers,
    getLiveRecommendations, serialize_beers, engine,
)
from elo import (
    fetch_elo_scores, push_elo_scores, fetch_survey_beers,
    load_user_comparisons_from_db, replay_elo_from_comparisons,
    build_elo_push_payload, compute_elo_update, DEFAULT_ELO,
    select_survey_matchup, get_completed_pairs,
    select_post_review_opponent, load_user_liked_reviewed_beers,
    get_post_review_pairs,
)
from vectors import get_style_family
import httpx
import uuid
import os

SPRING_BOOT_BASE_URL = os.getenv("SPRING_BOOT_BASE_URL")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"(https://.*\.vercel\.app|http://localhost:5173)",
    allow_credentials=True,
    allow_methods=ALL_METHODS,
    allow_headers=["*"],
)

# Load craft beer data and composite vectors on startup
beers_df, beer_vectors = loadData()

# Survey beers loaded from backend on startup
survey_df = None
survey_vectors = None
survey_beers_list = []


@app.on_event("startup")
async def load_survey_data():
    global survey_df, survey_vectors, survey_beers_list
    try:
        survey_beers_list = await fetch_survey_beers()
        survey_df, survey_vectors = loadSurveyBeers(
            survey_beers_list, beer_vectors.columns.tolist()
        )
        logging.info(f"Loaded {len(survey_df)} survey beers")
    except Exception as e:
        logging.warning(f"Failed to load survey beers from backend: {e}")
        survey_df = None
        survey_vectors = None
        survey_beers_list = []


# --- Existing endpoints ---

@app.get("/preview/beers", response_class=HTMLResponse)
def preview_beers(n: int = 5):
    html = beers_df.head(n).to_html(classes='table table-striped', index=False)
    return f"<html><body>{html}</body></html>"


EXPORT_DIR = "./exports"
os.makedirs(EXPORT_DIR, exist_ok=True)


@app.get("/export/beers")
def export_beers():
    path = os.path.join(EXPORT_DIR, "og_beers.csv")
    beers_df.to_csv(path, index=False)
    return FileResponse(path, filename="og_beers.csv", media_type="text/csv")


@app.get("/debug/vectorizer")
def debug_vectorizer():
    nulls = int(beers_df["flavor_tag"].isnull().sum())
    empties = int(beers_df["flavor_tag"].apply(lambda x: len(x) == 0 if isinstance(x, list) else False).sum())

    return {
        "beers": len(beers_df),
        "null_flavor_tags": nulls,
        "empty_lists": empties,
        "vector_shape": list(beer_vectors.shape),
        "vector_columns_sample": beer_vectors.columns.tolist()[:20],
        "survey_beers_loaded": len(survey_beers_list),
    }


@app.get('/dashboard', response_model=List)
def root():
    return beer_vectors.to_dict(orient='records')


# --- Main recommendation endpoint ---

@app.get("/live-recs/{user_id}")
async def getLiveRecs(user_id: uuid.UUID):
    user_id_str = str(user_id)

    # Fetch user's Elo scores from backend
    try:
        elo_data = await fetch_elo_scores(user_id_str)
        elo_scores = {item["beerId"]: item["score"] for item in elo_data}
    except httpx.HTTPError:
        elo_scores = {}

    is_fallback = len(elo_scores) == 0

    if is_fallback:
        recs = addDiversity(getPopularBeers(beers_df, 20), top_n=20)
    else:
        recs = getLiveRecommendations(
            elo_scores, beers_df, beer_vectors, survey_vectors
        )

    return {
        "fallback": is_fallback,
        "beers": serialize_beers(recs),
    }


# --- Comparison / matchup endpoints ---

@app.get("/comparisons/next/{user_id}")
async def getNextMatchup(
    user_id: uuid.UUID,
    skip: List[str] = Query(default=[]),
):
    """
    Serve the next pair of survey beers for onboarding comparison.
    `skip` accepts repeated query params, each a "<beerAId>:<beerBId>" pair the
    client wants to exclude this session (e.g. "Too Difficult" skips that aren't
    persisted to the comparisons table).
    """
    if not survey_beers_list:
        raise HTTPException(status_code=503, detail="Survey beers not loaded")

    user_id_str = str(user_id)

    # Get user's existing comparisons to avoid repeats
    comparisons = load_user_comparisons_from_db(engine, user_id_str)
    completed = get_completed_pairs(comparisons)

    # Union in client-supplied session skips
    for entry in skip:
        parts = entry.split(":")
        if len(parts) == 2:
            completed.add(tuple(sorted([parts[0], parts[1]])))

    survey_ids = [str(b["surveyBeerId"]) for b in survey_beers_list]
    matchup = select_survey_matchup(survey_ids, completed)

    if matchup is None:
        return {"complete": True, "message": "All survey pairs compared"}

    beer_a_id, beer_b_id = matchup

    # Find the full survey beer objects
    beer_a = next(b for b in survey_beers_list if str(b["surveyBeerId"]) == beer_a_id)
    beer_b = next(b for b in survey_beers_list if str(b["surveyBeerId"]) == beer_b_id)

    return {
        "complete": False,
        "beerA": beer_a,
        "beerB": beer_b,
    }


@app.post("/comparisons/submit/{user_id}")
async def submitComparison(user_id: uuid.UUID, submission: ComparisonSubmission):
    """
    Process a comparison: compute Elo updates and push to backend.
    The comparison record itself is saved by the frontend calling POST /api/comparisons on the backend.
    This endpoint handles the Elo score computation side.
    """
    user_id_str = str(user_id)
    winner_id = str(submission.winnerId)
    loser_id = str(submission.beerBId) if str(submission.winnerId) == str(submission.beerAId) else str(submission.beerAId)

    # Get current Elo scores from backend
    try:
        elo_data = await fetch_elo_scores(user_id_str)
        current_scores = {item["beerId"]: item["score"] for item in elo_data}
        current_counts = {item["beerId"]: item["comparisonCount"] for item in elo_data}
    except httpx.HTTPError:
        current_scores = {}
        current_counts = {}

    winner_rating = current_scores.get(winner_id, DEFAULT_ELO)
    loser_rating = current_scores.get(loser_id, DEFAULT_ELO)

    new_winner, new_loser = compute_elo_update(winner_rating, loser_rating)

    # Build updated scores
    current_scores[winner_id] = new_winner
    current_scores[loser_id] = new_loser
    current_counts[winner_id] = current_counts.get(winner_id, 0) + 1
    current_counts[loser_id] = current_counts.get(loser_id, 0) + 1

    payload = build_elo_push_payload(user_id_str, current_scores, current_counts)

    try:
        await push_elo_scores(payload)
    except httpx.HTTPError as e:
        logging.error(f"Failed to push Elo scores: {e}")
        raise HTTPException(status_code=503, detail="Failed to update Elo scores")

    return {
        "winnerId": winner_id,
        "loserId": loser_id,
        "winnerNewScore": new_winner,
        "loserNewScore": new_loser,
    }


# --- Post-review organic comparisons ---

def _safe_float(val):
    """Coerce to float, returning None for NaN / missing / non-numeric values."""
    try:
        f = float(val)
    except (TypeError, ValueError):
        return None
    return None if f != f else f  # f != f is True only for NaN


def _craft_to_card_dto(row) -> dict:
    """Normalize a bootstrapped_beers row into the survey-beer DTO shape used
    by ComparisonCard on the frontend."""
    return {
        "surveyBeerId": str(row["beer_id"]),
        "name": row["name"],
        "style": row["style"],
        "styleFamily": get_style_family(row["style"] or ""),
        "abv": _safe_float(row.get("abv")),
        "ibu": _safe_float(row.get("ibu")),
        "imageUrl": None,
        "flavorTags": list(row.get("flavor_tag") or []),
    }


def _survey_to_card_dto(beer: dict) -> dict:
    """Survey beers from the backend already match the card shape; pass through."""
    return {
        "surveyBeerId": str(beer["surveyBeerId"]),
        "name": beer.get("name"),
        "style": beer.get("style"),
        "styleFamily": beer.get("styleFamily"),
        "abv": beer.get("abv"),
        "ibu": beer.get("ibu"),
        "imageUrl": beer.get("imageUrl"),
        "flavorTags": beer.get("flavorTags") or [],
    }


@app.get("/comparisons/post-review/{user_id}")
async def getPostReviewMatchup(
    user_id: uuid.UUID,
    reviewed_beer_id: uuid.UUID = Query(...),
    skip: List[str] = Query(default=[]),
):
    """
    After a user reviews a craft beer, return one comparison pair: the
    just-reviewed beer vs. an opponent picked via the cascade in
    `select_post_review_opponent`. `skip` accepts repeated "<a>:<b>" pairs
    the client wants to exclude this session ("Skip this pair").
    """
    user_id_str = str(user_id)
    reviewed_id_str = str(reviewed_beer_id)

    reviewed_rows = beers_df[beers_df["beer_id"] == reviewed_id_str]
    if reviewed_rows.empty:
        raise HTTPException(status_code=404, detail="Reviewed beer not found in catalog")
    reviewed_row = reviewed_rows.iloc[0]
    reviewed_style_family = get_style_family(reviewed_row["style"] or "")

    try:
        elo_data = await fetch_elo_scores(user_id_str)
        elo_scores = {item["beerId"]: item["score"] for item in elo_data}
    except httpx.HTTPError:
        elo_scores = {}

    liked_reviewed = load_user_liked_reviewed_beers(engine, user_id_str)
    liked_reviewed = [b for b in liked_reviewed if b["beerId"] != reviewed_id_str]

    survey_meta = [
        {"id": str(b["surveyBeerId"]), "styleFamily": b.get("styleFamily")}
        for b in survey_beers_list
    ]

    comparisons = load_user_comparisons_from_db(engine, user_id_str)
    excluded_pairs = get_post_review_pairs(comparisons)
    for entry in skip:
        parts = entry.split(":")
        if len(parts) == 2:
            excluded_pairs.add(tuple(sorted([parts[0], parts[1]])))

    opponent_id = select_post_review_opponent(
        reviewed_id_str,
        reviewed_style_family,
        elo_scores,
        liked_reviewed,
        survey_meta,
        excluded_pairs,
    )

    if opponent_id is None:
        return {"complete": True, "message": "No opponent available"}

    # Resolve opponent into the card DTO shape regardless of source
    opponent_dto = None
    survey_match = next(
        (b for b in survey_beers_list if str(b["surveyBeerId"]) == opponent_id),
        None,
    )
    if survey_match is not None:
        opponent_dto = _survey_to_card_dto(survey_match)
    else:
        craft_rows = beers_df[beers_df["beer_id"] == opponent_id]
        if not craft_rows.empty:
            opponent_dto = _craft_to_card_dto(craft_rows.iloc[0])

    if opponent_dto is None:
        return {"complete": True, "message": "Opponent could not be resolved"}

    return {
        "complete": False,
        "beerA": _craft_to_card_dto(reviewed_row),
        "beerB": opponent_dto,
    }


# --- Existing proxy endpoints ---

@app.get('/reviews/{user_id}', response_model=List[ReviewMinimalDTO])
async def getUserReviews(user_id: uuid.UUID):
    url = f"{SPRING_BOOT_BASE_URL}/api/user/reviews/user/{user_id}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()


@app.get("/debug/{user_id}")
def debug_user(user_id: uuid.UUID):
    user_id_str = str(user_id)
    comparisons = load_user_comparisons_from_db(engine, user_id_str)
    return {
        "userId": user_id_str,
        "comparisons": len(comparisons),
        "comparisons_detail": comparisons,
    }
