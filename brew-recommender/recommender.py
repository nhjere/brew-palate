
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv
from vectors import build_composite_vectors, build_survey_vectors

load_dotenv()
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT"))
DB_NAME = os.getenv("DB_NAME")

engine = create_engine(f'postgresql+psycopg://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}')


def loadData():
    """Load craft beers from DB and build composite vectors."""
    query = """
        SELECT
            bb.beer_id,
            bb.abv,
            bb.brewery_uuid,
            bb.ibu,
            bb.name,
            bb.ounces,
            bb.style,
            ARRAY_AGG(DISTINCT bft.flavor_tag) AS flavor_tag
        FROM bootstrapped_beers bb
        LEFT JOIN bootstrapped_beer_flavor_tags bft ON bb.beer_id = bft.beer_id
        GROUP BY bb.beer_id, bb.abv, bb.brewery_uuid, bb.ibu, bb.name, bb.ounces, bb.style
    """

    beers_df = pd.read_sql(query, engine)
    beers_df["flavor_tag"] = beers_df["flavor_tag"].apply(lambda tags: [t.lower() for t in tags if t])
    beers_df["beer_id"] = beers_df["beer_id"].astype(str)

    # Build composite vectors (replaces TF-IDF)
    beer_vectors = build_composite_vectors(beers_df)

    return beers_df, beer_vectors


def loadSurveyBeers(survey_beers_json: list[dict], reference_columns: list[str]) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Build a DataFrame and vectors for survey beers from the backend API response.
    reference_columns: column names from the craft beer vector DataFrame for alignment.
    """
    survey_df = pd.DataFrame(survey_beers_json)
    survey_df["surveyBeerId"] = survey_df["surveyBeerId"].astype(str)

    survey_vectors = build_survey_vectors(survey_df, reference_columns)
    return survey_df, survey_vectors


''' RECOMMENDER LOGIC '''


def addDiversity(df, top_n=30, top_tag_ratio=0.7):
    selected = []
    selected_ids = set()

    # Count how often each tag appears in this set
    global_tag_counts = {}
    for tags in df["flavor_tag"]:
        for tag in tags:
            global_tag_counts[tag] = global_tag_counts.get(tag, 0) + 1

    # Sort tags by frequency in top recommendations
    sorted_tags = sorted(global_tag_counts.items(), key=lambda x: -x[1])
    tag_total = len(sorted_tags)
    top_tags = [tag for tag, _ in sorted_tags[:max(1, tag_total // 5)]]
    rare_tags = [tag for tag, _ in sorted_tags[-max(1, tag_total // 4):]]

    # Choose beers with top tags (prioritize)
    for _, row in df.iterrows():
        if len(selected) >= int(top_n * top_tag_ratio):
            break
        beer_id = row["beer_id"]
        if beer_id in selected_ids:
            continue
        if any(tag in top_tags for tag in row["flavor_tag"]):
            selected.append(row)
            selected_ids.add(beer_id)

    # Add beers with rare tags (encourage diversity)
    for _, row in df.iterrows():
        if len(selected) >= top_n:
            break
        beer_id = row["beer_id"]
        if beer_id in selected_ids:
            continue
        if any(tag in rare_tags for tag in row["flavor_tag"]):
            selected.append(row)
            selected_ids.add(beer_id)

    # Pad if necessary
    for _, row in df.iterrows():
        if len(selected) >= top_n:
            break
        beer_id = row["beer_id"]
        if beer_id not in selected_ids:
            selected.append(row)
            selected_ids.add(beer_id)

    return pd.DataFrame(selected)


def getPopularBeers(beers_df, num_recs):
    """
    Fallback for users with no comparisons and no reviews.
    Returns a diverse set of beers sorted by style variety.
    """
    diverse = beers_df.drop_duplicates(subset="style", keep="first")
    top_beers = diverse.head(num_recs) if len(diverse) >= num_recs else beers_df.head(num_recs)
    return top_beers


def getProfileVector(elo_scores: dict[str, float], all_vectors: pd.DataFrame) -> np.ndarray | None:
    """
    Build a user's taste profile vector from Elo-weighted beer vectors.

    elo_scores: {beer_id_str: elo_score} from comparisons
    all_vectors: DataFrame of composite vectors (craft + survey), indexed by beer_id

    Beers with Elo > 1500 (baseline) pull the profile toward them.
    Beers with Elo < 1500 push the profile away (negative signal).
    """
    if not elo_scores:
        return None

    liked_vectors = []
    liked_weights = []
    disliked_vectors = []
    disliked_weights = []

    for beer_id, score in elo_scores.items():
        if beer_id in all_vectors.index:
            vec = all_vectors.loc[beer_id].values
            deviation = score - DEFAULT_ELO
            if deviation > 0:
                liked_vectors.append(vec)
                liked_weights.append(deviation)
            elif deviation < 0:
                disliked_vectors.append(vec)
                disliked_weights.append(abs(deviation))

    if not liked_vectors:
        return None

    # Build positive profile from liked beers
    liked_arr = np.array(liked_vectors)
    liked_w = np.array(liked_weights)
    positive_profile = np.average(liked_arr, axis=0, weights=liked_w)

    # Subtract disliked direction to push away from disliked beers
    if disliked_vectors:
        disliked_arr = np.array(disliked_vectors)
        disliked_w = np.array(disliked_weights)
        negative_profile = np.average(disliked_arr, axis=0, weights=disliked_w)
        # Blend: positive signal dominant, negative signal as mild penalty
        user_vector = positive_profile - 0.3 * negative_profile
    else:
        user_vector = positive_profile

    norm = np.linalg.norm(user_vector)
    return user_vector / norm if norm > 0 else user_vector


# Elo baseline — must match elo.py DEFAULT_ELO
DEFAULT_ELO = 1500.0


def getLiveRecommendations(
    elo_scores: dict[str, float],
    beers_df: pd.DataFrame,
    beer_vectors: pd.DataFrame,
    survey_vectors: pd.DataFrame | None = None,
    num_recs: int = 20,
) -> pd.DataFrame:
    """
    Generate recommendations using Elo-weighted profile vectors and cosine similarity.

    elo_scores: {beer_id: score} from the user's comparison history
    beer_vectors: composite vectors for craft beers
    survey_vectors: composite vectors for survey beers (used in profile building)
    """
    # Combine craft + survey vectors for profile building
    if survey_vectors is not None and not survey_vectors.empty:
        all_vectors = pd.concat([beer_vectors, survey_vectors])
    else:
        all_vectors = beer_vectors

    user_profile = getProfileVector(elo_scores, all_vectors)

    if user_profile is None:
        popular_beers = getPopularBeers(beers_df, num_recs)
        return addDiversity(popular_beers, top_n=num_recs)

    # Score only against craft beers (not survey beers)
    similarity_scores = cosine_similarity([user_profile], beer_vectors.values)[0]

    # Exclude beers the user has already compared
    beer_ids = beer_vectors.index.tolist()
    compared_ids = set(elo_scores.keys())
    # Only exclude craft beers that have been compared (survey beers aren't in beer_vectors)
    compared_indices = {i for i, bid in enumerate(beer_ids) if bid in compared_ids}

    recommended_indices = [
        i for i in similarity_scores.argsort()[::-1]
        if i not in compared_indices
    ]

    top_n_indices = recommended_indices[:num_recs * 5]
    recommended_beer_ids = [beer_ids[i] for i in top_n_indices]

    top_recs = beers_df[beers_df["beer_id"].isin(recommended_beer_ids)].copy()
    top_recs = top_recs.head(num_recs * 5)
    diverse_recs = addDiversity(top_recs, top_n=num_recs)
    return diverse_recs


def safe_float(val):
    try:
        return float(val)
    except (TypeError, ValueError):
        return None


def serialize_beers(df):
    return [
        {
            "beerId": row["beer_id"],
            "abv": safe_float(row.get("abv")),
            "ibu": safe_float(row.get("ibu")),
            "name": row["name"],
            "style": row["style"],
            "ounces": safe_float(row.get("ounces")),
            "breweryUuid": str(row.get("brewery_uuid")),
            "flavorTags": row.get("flavor_tag", []) or []
        }
        for _, row in df.fillna("").iterrows()
    ]
