from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from typing import List, Optional
import pandas as pd
import httpx
import uuid
from classes import ReviewMinimalDTO, Beer
from recommender import loadData, convertReviews, recommendBeers, getLiveRecommendations

def safe_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None

SPRING_BOOT_BASE_URL = "http://localhost:8080"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

beers_df, reviews_df, beer_vectors = loadData()

@app.get('/dashboard', response_model=List)
def root():
    return beer_vectors.to_dict(orient='records')

@app.get("/recs/{user_id}", response_model=List[Beer])
def getRecommendations(user_id: uuid.UUID):
    user_id_str = str(user_id)
    if user_id_str not in reviews_df["userId"].values:
        return []

    recs = recommendBeers(user_id, reviews_df, beers_df, beer_vectors, num_recs=20)

    return [
        {
            "beerId": row["beer_id"],
            "id": str(row.get("external_beer_id") or ""),
            "name": row["name"],
            "style": row["style"],
            "abv": row.get("abv"),
            "ibu": row.get("ibu"),
            "ounces": row.get("ounces"),
            "breweryId": str(row.get("external_brewery_id") or ""),
            "flavorTags": row["flavor_tag"]
        }
        for i, row in recs.iterrows()
    ]

@app.get("/live-recs/{user_id}", response_model=List[Beer])
async def getLiveRecs(user_id: uuid.UUID):
    url = f"{SPRING_BOOT_BASE_URL}/api/user/reviews/user/{user_id}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        reviews_json = response.json()

    user_reviews_df = convertReviews(reviews_json)
    live_recs = getLiveRecommendations(user_id, reviews_df, beers_df, beer_vectors, user_reviews_df)

    return [
    {
        "beerId": row["beer_id"],
        "id": str(row.get("external_beer_id") or ""),
        "name": row["name"],
        "style": row["style"],
        "abv": safe_float(row.get("abv")),
        "ibu": safe_float(row.get("ibu")),
        "ounces": safe_float(row.get("ounces")),
        "breweryId": str(row.get("external_brewery_id") or ""),
        "flavorTags": row.get("flavor_tag", []) or []
    }
    for _, row in live_recs.fillna("").iterrows()
]

# this api endpoint can be repurposed to display User's past reviews
@app.get('/reviews/{user_id}', response_model=List[ReviewMinimalDTO])
async def getUserReviews(user_id: uuid.UUID):
    url = f"{SPRING_BOOT_BASE_URL}/api/user/reviews/user/{user_id}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()


@app.get("/debug/{user_id}")
def debug_user(user_id: uuid.UUID):
    print(reviews_df.shape)
    print(reviews_df["userId"].value_counts().head())
    user_id_str = str(user_id)
    user_reviews = reviews_df[reviews_df["userId"] == user_id_str]
    return user_reviews.to_dict(orient="records")
