import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import ast

def loadData():
    # load and consolidate beer df
    beers_filepath = '../beer_pool.csv'
    beers_df = pd.read_csv(beers_filepath)
    tags_filepath = '../beer_ft_pool.csv'
    tags_df = pd.read_csv(tags_filepath)
    complete_beers = pd.merge(beers_df, tags_df, on='beer_id')
    beers_df = complete_beers.groupby('beer_id').agg({
        'abv': 'first',
        'brewery_uuid': 'first',
        'ibu': 'first',
        'name': 'first',
        'ounces': 'first',
        'style': 'first',
        'flavor_tag': lambda x: list(set(x))
    }).reset_index()

    # load reviews df
    reviews_filepath = '../new_reviews.csv'
    reviews_df = pd.read_csv(reviews_filepath)
    reviews_df["userId"] = reviews_df["userId"].astype(str)
    reviews_df["beerId"] = reviews_df["beerId"].astype(str)
    reviews_df["flavorTags"] = reviews_df["flavorTags"].apply(ast.literal_eval)

    # vectorizes beers
    beer_vectors = vectorizeBeers(beers_df)

    return beers_df, reviews_df, beer_vectors

def convertReviews(json_reviews):
    return pd.DataFrame(json_reviews)

def vectorizeBeers(beers_df):
    # concatenates and vectorizes flavor tag fields for each beer
    beers_df["tag_string"] = beers_df["flavor_tag"].apply(lambda tags: " ".join(tags))
    vectorizer = TfidfVectorizer()
    beer_tag_matrix = vectorizer.fit_transform(beers_df["tag_string"])
    beer_vectors = pd.DataFrame(
        beer_tag_matrix.toarray(),
        index=beers_df["beer_id"],
        columns=vectorizer.get_feature_names_out()
    )

    # manually down weight sessionable because it shows up too much
    if "sessionable" in beer_vectors.columns:
        beer_vectors["sessionable"] *= 0.2 

    return beer_vectors

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

def getPopularBeers(reviews_df, beers_df, num_recs):
    min_reviews = 3

    beer_stats = (
        reviews_df.groupby("beerId")["overallEnjoyment"]
        .agg(["mean", "count"])
        .reset_index()
        .rename(columns={"mean": "avg_rating", "count": "num_reviews"})
    )
    
    popular_beers = beer_stats[beer_stats["num_reviews"] >= min_reviews]
    merged = popular_beers.merge(beers_df, left_on="beerId", right_on="beer_id")
    sorted_beers = merged.sort_values(by="avg_rating", ascending=False)
    diverse = sorted_beers.drop_duplicates(subset="style", keep="first")
    top_beers = diverse.head(num_recs) if len(diverse) >= num_recs else sorted_beers.head(num_recs)


    return top_beers[["beer_id", "name", "style", "flavor_tag", "avg_rating", "num_reviews"]]

def getProfileVector(user_reviews_df, beer_matrix, beer_ids):
    
    # Keep only liked beers (rating >= 4)
    if user_reviews_df.empty or "overallEnjoyment" not in user_reviews_df.columns:
        return None

    liked = user_reviews_df[user_reviews_df["overallEnjoyment"] >= 4][["beerId", "overallEnjoyment"]]

    if liked.empty:
        return None

    vectors = []
    weights = []

    for _, row in liked.iterrows():
        beer_id = row["beerId"]
        if beer_id in beer_ids:
            index = beer_ids.index(beer_id)
            vectors.append(beer_matrix[index])
            weights.append(row["overallEnjoyment"])

    if not vectors:
        return None

    user_vector = np.average(np.array(vectors), axis=0, weights=np.array(weights))
    norm = np.linalg.norm(user_vector)
    return user_vector / norm if norm > 0 else user_vector


def getLiveRecommendations(user_id, reviews_df, beers_df, beer_vectors, user_reviews_df, num_recs=20):
    beer_ids = beers_df["beer_id"].tolist()
    user_profile = getProfileVector(user_reviews_df, beer_vectors.values, beer_ids)

    # likely will have to change to reflect beer flavor tags chosen in initial user preference survey
    if user_profile is None:
        print(f"[LiveRecs] No user vector, using popular fallback.")
        popular_beers = getPopularBeers(reviews_df, beers_df, num_recs)
        return addDiversity(popular_beers, top_n=num_recs)

    similarity_scores = cosine_similarity([user_profile], beer_vectors.values)[0]

    # Exclude beers already reviewed highly by this user
    liked_beer_ids = user_reviews_df[user_reviews_df["overallEnjoyment"] >= 4]["beerId"].tolist()
    liked_beer_indices = [i for i, bid in enumerate(beer_ids) if bid in liked_beer_ids]

    recommended_indices = [i for i in similarity_scores.argsort()[::-1] if i not in liked_beer_indices]

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
    







