import ast
import logging
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from typing import List, Optional
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.cors import ALL_METHODS
from classes import ReviewMinimalDTO, Beer
from recommender import addDiversity, getPopularBeers, loadData, convertReviews, getLiveRecommendations, serialize_beers
import httpx
import uuid
import os

# CHANGE TO BASE_URL DEFINED IN ENV
SPRING_BOOT_BASE_URL = os.getenv("SPRING_BOOT_BASE_URL")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"(https://.*\.vercel\.app|http://localhost:5173)",
    allow_credentials=True,
    allow_methods=ALL_METHODS,
    allow_headers=["*"],
)

beers_df, reviews_df, beer_vectors = loadData()

@app.get("/preview/beers", response_class=HTMLResponse)
def preview_beers(n: int = 5):
    html = beers_df.head(n).to_html(classes='table table-striped', index=False)
    return f"<html><body>{html}</body></html>"

@app.get("/preview/reviews", response_class=HTMLResponse)
def preview_reviews(n: int = 5):
    html = reviews_df.head(n).to_html(classes='table table-striped', index=False)
    return f"<html><body>{html}</body></html>"

EXPORT_DIR = "./exports"
os.makedirs(EXPORT_DIR, exist_ok=True)

@app.get("/export/beers")
def export_beers():
    path = os.path.join(EXPORT_DIR, "og_beers.csv")
    beers_df.to_csv(path, index=False)
    return FileResponse(path, filename="og_beers.csv", media_type="text/csv")

@app.get("/export/reviews")
def export_reviews():
    path = os.path.join(EXPORT_DIR, "og_reviews.csv")
    reviews_df.to_csv(path, index=False)
    return FileResponse(path, filename="og_reviews.csv", media_type="text/csv")

@app.get("/debug/vectorizer")
def debug_vectorizer():
    nulls = beers_df["flavor_tag"].isnull().sum()
    empties = beers_df["flavor_tag"].apply(lambda x: len(x) == 0 if isinstance(x, list) else False).sum()
    tag_string_empty = beers_df["tag_string"].eq("").sum()

    return {
        "beers": len(beers_df),
        "null_flavor_tags": nulls,
        "empty_lists": empties,
        "empty_tag_strings": tag_string_empty,
        "vector_shape": beer_vectors.shape
    }


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
