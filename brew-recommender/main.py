import logging
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from typing import List, Optional
from fastapi.responses import JSONResponse
import pandas as pd
import httpx
import uuid
from classes import ReviewMinimalDTO, Beer
from recommender import addDiversity, getPopularBeers, loadData, convertReviews, getLiveRecommendations, serialize_beers

def safe_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None

SPRING_BOOT_BASE_URL = "http://localhost:8080"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","brew-palate-alpha.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

beers_df, reviews_df, beer_vectors = loadData()

@app.get('/dashboard', response_model=List)
def root():
    return beer_vectors.to_dict(orient='records')

@app.get("/live-recs/{user_id}")
async def getLiveRecs(user_id: uuid.UUID):
    url = f"{SPRING_BOOT_BASE_URL}/api/user/reviews/user/{user_id}"

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:  # 5 second timeout
            response = await client.get(url)
            response.raise_for_status()
            reviews_json = response.json()

    except httpx.HTTPError as e:
        logging.warning(f"Request to Spring Boot failed: {e}")
        return JSONResponse(status_code=503, content={"error": "Downstream service unavailable"})


    user_reviews_df = convertReviews(reviews_json)
    is_fallback = user_reviews_df.empty or "overallEnjoyment" not in user_reviews_df.columns

    recs = (
        addDiversity(getPopularBeers(reviews_df, beers_df, 20), top_n=20)
        if is_fallback else
        getLiveRecommendations(user_id, reviews_df, beers_df, beer_vectors, user_reviews_df)
    )

    return {
        "fallback": is_fallback,
        "beers": serialize_beers(recs)
    }

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
