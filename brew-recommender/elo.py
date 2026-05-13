import httpx
import random
import os
from dotenv import load_dotenv
from vectors import get_style_family

load_dotenv()
SPRING_BOOT_BASE_URL = os.getenv("SPRING_BOOT_BASE_URL")

# --- Elo math ---

K_FACTOR = 32
DEFAULT_ELO = 1500.0


def expected_score(rating_a: float, rating_b: float) -> float:
    """Expected probability that A wins against B."""
    return 1.0 / (1.0 + 10.0 ** ((rating_b - rating_a) / 400.0))


def compute_elo_update(
    winner_rating: float, loser_rating: float, k: float = K_FACTOR
) -> tuple[float, float]:
    """
    Compute new Elo ratings after a comparison.
    Returns (new_winner_rating, new_loser_rating).
    """
    expected_win = expected_score(winner_rating, loser_rating)
    expected_lose = expected_score(loser_rating, winner_rating)

    new_winner = winner_rating + k * (1.0 - expected_win)
    new_loser = loser_rating + k * (0.0 - expected_lose)

    return new_winner, new_loser


# --- Backend API calls ---

async def fetch_elo_scores(user_id: str) -> list[dict]:
    """GET /api/elo/{user_id} — returns list of {userId, beerId, score, comparisonCount}."""
    url = f"{SPRING_BOOT_BASE_URL}/api/elo/{user_id}"
    async with httpx.AsyncClient(timeout=5.0) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()


async def push_elo_scores(scores: list[dict]) -> None:
    """PUT /api/elo — batch upsert Elo scores to the backend."""
    url = f"{SPRING_BOOT_BASE_URL}/api/elo"
    async with httpx.AsyncClient(timeout=5.0) as client:
        response = await client.put(url, json=scores)
        response.raise_for_status()


async def fetch_survey_beers() -> list[dict]:
    """GET /api/survey-beers — returns all survey beers."""
    url = f"{SPRING_BOOT_BASE_URL}/api/survey-beers"
    async with httpx.AsyncClient(timeout=5.0) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()


async def fetch_user_comparisons(user_id: str) -> list[dict]:
    """GET /api/comparisons/history — returns user's comparison history."""
    # This endpoint requires JWT auth which we don't have service-to-service.
    # For now, we read comparisons from the DB directly via SQLAlchemy.
    # TODO: add a service-to-service comparisons endpoint to the backend
    raise NotImplementedError("Use load_user_comparisons_from_db instead")


def load_user_comparisons_from_db(engine, user_id: str) -> list[dict]:
    """Read comparisons directly from the DB for a given user."""
    from sqlalchemy import text

    query = text("""
        SELECT comparison_id, user_id, beer_a_id, beer_b_id, winner_id, context, created_at
        FROM user_comparisons
        WHERE user_id = :uid
        ORDER BY created_at
    """)
    with engine.connect() as conn:
        rows = conn.execute(query, {"uid": user_id}).fetchall()

    return [
        {
            "comparisonId": str(row[0]),
            "userId": str(row[1]),
            "beerAId": str(row[2]),
            "beerBId": str(row[3]),
            "winnerId": str(row[4]),
            "context": row[5],
            "createdAt": str(row[6]),
        }
        for row in rows
    ]


def replay_elo_from_comparisons(comparisons: list[dict]) -> dict[str, float]:
    """
    Replay all comparisons in order to compute current Elo scores.
    Returns {beer_id_str: elo_score}.
    """
    scores: dict[str, float] = {}

    for comp in comparisons:
        beer_a = comp["beerAId"]
        beer_b = comp["beerBId"]
        winner = comp["winnerId"]
        loser = beer_b if winner == beer_a else beer_a

        winner_rating = scores.get(winner, DEFAULT_ELO)
        loser_rating = scores.get(loser, DEFAULT_ELO)

        new_winner, new_loser = compute_elo_update(winner_rating, loser_rating)
        scores[winner] = new_winner
        scores[loser] = new_loser

    return scores


def build_elo_push_payload(user_id: str, scores: dict[str, float], comparison_counts: dict[str, int]) -> list[dict]:
    """Build the payload for PUT /api/elo."""
    return [
        {
            "userId": user_id,
            "beerId": beer_id,
            "score": score,
            "comparisonCount": comparison_counts.get(beer_id, 0),
        }
        for beer_id, score in scores.items()
    ]


# --- Matchup selection ---

def select_survey_matchup(
    survey_beer_ids: list[str],
    completed_pairs: set[tuple[str, str]],
) -> tuple[str, str] | None:
    """
    Pick the next pair of survey beers for onboarding.
    Avoids repeating pairs the user has already compared.
    Returns (beer_a_id, beer_b_id) or None if all pairs exhausted.
    """
    available = []
    for i in range(len(survey_beer_ids)):
        for j in range(i + 1, len(survey_beer_ids)):
            a, b = survey_beer_ids[i], survey_beer_ids[j]
            pair = tuple(sorted([a, b]))
            if pair not in completed_pairs:
                available.append((a, b))

    if not available:
        return None

    return random.choice(available)


def get_completed_pairs(comparisons: list[dict]) -> set[tuple[str, str]]:
    """Extract the set of already-compared pairs from comparison history."""
    pairs = set()
    for comp in comparisons:
        pair = tuple(sorted([comp["beerAId"], comp["beerBId"]]))
        pairs.add(pair)
    return pairs


def get_post_review_pairs(comparisons: list[dict]) -> set[tuple[str, str]]:
    """Sorted-pair set for prior post-review comparisons only."""
    pairs = set()
    for comp in comparisons:
        if comp.get("context") == "post-review":
            pair = tuple(sorted([comp["beerAId"], comp["beerBId"]]))
            pairs.add(pair)
    return pairs


# --- Post-review opponent selection ---

def load_user_liked_reviewed_beers(engine, user_id: str) -> list[dict]:
    """
    Returns prior reviews with overall_enjoyment > 3, joined to bootstrapped_beers
    so callers can match on style_family. Each entry: {"beerId", "style", "styleFamily"}.
    """
    from sqlalchemy import text

    query = text("""
        SELECT ur.beer_id, bb.style
        FROM user_reviews ur
        JOIN bootstrapped_beers bb ON ur.beer_id = bb.beer_id
        WHERE ur.user_id = :uid AND ur.overall_enjoyment > 3
    """)
    with engine.connect() as conn:
        rows = conn.execute(query, {"uid": user_id}).fetchall()

    return [
        {
            "beerId": str(row[0]),
            "style": row[1],
            "styleFamily": get_style_family(row[1] or ""),
        }
        for row in rows
    ]


def _pick_best(candidates: list[str], elo_scores: dict[str, float]) -> str | None:
    """Pick highest-Elo from candidates; tie-break random; missing = DEFAULT_ELO."""
    if not candidates:
        return None
    max_score = max(elo_scores.get(c, DEFAULT_ELO) for c in candidates)
    top = [c for c in candidates if elo_scores.get(c, DEFAULT_ELO) == max_score]
    return random.choice(top)


def select_post_review_opponent(
    reviewed_beer_id: str,
    reviewed_style_family: str,
    elo_scores: dict[str, float],
    liked_reviewed: list[dict],
    survey_meta: list[dict],
    excluded_pairs: set[tuple[str, str]],
) -> str | None:
    """
    Pick an opponent for a post-review comparison via priority cascade:
      1. Liked reviewed beers (overall_enjoyment > 3), same style_family
      2. Liked reviewed beers, any style_family
      3. Survey beers with net Elo win (> 1500), same style_family
      4. Survey beers with net win, any style_family
      5. Random survey beer, same style_family
      6. Random survey beer, any style_family
    Within each bucket: highest Elo first, ties broken randomly.

    survey_meta: list of {"id", "styleFamily"}.
    excluded_pairs: sorted (id_a, id_b) tuples already used in post-review or
                    skipped by the client this session.
    """
    def not_excluded(opp_id: str) -> bool:
        if opp_id == reviewed_beer_id:
            return False
        return tuple(sorted([reviewed_beer_id, opp_id])) not in excluded_pairs

    liked_same = [
        b["beerId"] for b in liked_reviewed
        if b["styleFamily"] == reviewed_style_family and not_excluded(b["beerId"])
    ]
    liked_any = [b["beerId"] for b in liked_reviewed if not_excluded(b["beerId"])]

    survey_family_by_id = {s["id"]: s["styleFamily"] for s in survey_meta}
    survey_winners = [
        s["id"] for s in survey_meta
        if elo_scores.get(s["id"], DEFAULT_ELO) > DEFAULT_ELO and not_excluded(s["id"])
    ]
    survey_winners_same = [
        sid for sid in survey_winners
        if survey_family_by_id.get(sid) == reviewed_style_family
    ]

    survey_all = [s["id"] for s in survey_meta if not_excluded(s["id"])]
    survey_all_same = [
        s["id"] for s in survey_meta
        if s["styleFamily"] == reviewed_style_family and not_excluded(s["id"])
    ]

    for bucket in (
        liked_same, liked_any,
        survey_winners_same, survey_winners,
        survey_all_same, survey_all,
    ):
        choice = _pick_best(bucket, elo_scores)
        if choice is not None:
            return choice
    return None
