# brew-recommender

FastAPI microservice that powers BrewPalate's beer recommendation engine. Communicates with the Spring Boot backend (brew-backend) to fetch user reviews, then computes personalized recommendations using content-based filtering.

## Run Locally

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

Requires a `.env` with: `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `SPRING_BOOT_BASE_URL`

## Key Files

- `main.py` — FastAPI app, defines all endpoints. Loads beer/review data on startup.
- `recommender.py` — Core recommendation logic: vectorization, profile building, similarity scoring, diversity filtering.
- `classes.py` — Pydantic DTOs (ReviewMinimalDTO, Beer).
- `data/` — Contains any local CSV exports or seed data.

## How It Works Today

1. Beers are vectorized via TF-IDF on flavor tags (`vectorizeBeers()`)
2. A user's profile vector is built by averaging flavor vectors of beers they rated ≥ 4 stars, weighted by `overallEnjoyment` (`getProfileVector()`)
3. Recommendations are the highest cosine-similarity beers to the user's profile, with style diversity enforced (`getLiveRecommendations()`)
4. Users with no reviews get a popular-beers fallback (`getPopularBeers()`)

## API Endpoints

- `GET /live-recs/{user_id}` — Main recommendation endpoint. Fetches user reviews from Spring Boot, returns personalized (or fallback) beer list.
- `GET /reviews/{user_id}` — Proxy to Spring Boot for user review history.
- `GET /debug/{user_id}` — Debug endpoint showing user's review data.
- `GET /preview/beers`, `/preview/reviews` — HTML table previews.
- `GET /export/beers`, `/export/reviews` — CSV downloads.

## Database

Connects directly to PostgreSQL (same Railway-hosted DB as brew-backend) via SQLAlchemy. On startup, `loadData()` unions two beer sources and their tags:

- `bootstrapped_beers` + `imported_beers` → combined beer catalog
- `bootstrapped_beer_flavor_tags` + `imported_beer_flavor_tags` → combined flavor tags
- `user_reviews` → real user review data

Other tables in the DB (not directly queried by this service): `brewery_profiles`, `user_profiles`, `user_follows`, `review_flavor_tags`, `spatial_ref_sys`.

## Architecture Context

- The frontend (brew-frontend on Vercel) calls this service directly for recommendations via `VITE_RECOMMENDATION_BASE_URL`.
- This service calls Spring Boot (`SPRING_BOOT_BASE_URL`) to fetch user reviews — it does not accept auth tokens directly.
- Beer data is loaded once on startup and held in memory as DataFrames.

## Active Refactor

Migrating from TF-IDF + overallEnjoyment rating-based recommendations to a pairwise comparison engine with Elo scoring. See `docs/refactor-scope.md` for the full plan. Summary of changes:

- Replace TF-IDF with composite vectors (one-hot flavor tags + style family + normalized ABV/IBU)
- Add Elo scoring functions for pairwise comparison results
- Add `/comparisons/next` endpoint for matchup selection
- Add cold-start survey flow using curated macro beer brands (survey_beers table)
- Modify `getProfileVector()` to weight by Elo scores instead of (or blended with) review ratings

## Conventions

- Python 3.11+, no type: ignore comments — fix types properly
- UUIDs are strings in DataFrames, UUID objects in API layer
- All beer serialization goes through `serialize_beers()` for consistent output shape
- The `addDiversity()` function must always wrap final recommendation output to ensure style variety