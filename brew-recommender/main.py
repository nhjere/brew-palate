from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import pandas as pd
import uuid;

import httpx
from recommender import loadData, convertReviews, recommendBeers

SPRING_BOOT_BASE_URL = "http://localhost:8080"
app = FastAPI()

beers_df, reviews_df, beer_vectors = loadData()

class ReviewMinimalDTO(BaseModel):
    userId: uuid.UUID
    beerId: uuid.UUID
    overallEnjoyment: int
    flavorTags: List[str]

class BeerRecommendation(BaseModel):
    beerId: uuid.UUID
    name: str
    style: str
    flavor_tag: List[str]

@app.get('/dashboard', response_model=List)
def root():
    return beer_vectors.to_dict(orient='records')

@app.get("/recs/{user_id}", response_model=List[BeerRecommendation])
def get_recommendations(user_id: uuid.UUID):

    user_id_str = str(user_id)
    if user_id_str not in reviews_df["userId"].values:
        return []
    
    recs = recommendBeers(user_id, reviews_df, beers_df, beer_vectors, num_recs=20)

    return [
        {
            "beerId": row["beer_id"],
            "name": row["name"],
            "style": row["style"],
            "flavor_tag": row["flavor_tag"]
        }
        for _, row in recs.iterrows()
    ]

@app.get("/debug/{user_id}")
def debug_user(user_id: uuid.UUID):
    print(reviews_df.shape)
    print(reviews_df["userId"].value_counts().head())
    user_id_str = str(user_id)
    user_reviews = reviews_df[reviews_df["userId"] == user_id_str]
    return user_reviews.to_dict(orient="records")


''' springboot api call IGNORE FOR NOW '''

@app.get('/recommend/{user_id}', response_model=List[ReviewMinimalDTO])
async def getUserReviews(user_id: uuid.UUID):
    url = f"{SPRING_BOOT_BASE_URL}/api/user/reviews/user/{user_id}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()

