# brew-recommender

FastAPI microservice that powers BrewPalate's beer recommendation engine. Users rank beers through pairwise comparisons, which produce per-user Elo scores. Recommendations come from content-based filtering against an Elo-weighted taste profile.

## Run Locally

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

Requires a `.env` with: `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `SPRING_BOOT_BASE_URL`

## Key Files

- `main.py` — FastAPI app, defines all endpoints. Loads the beer catalog and survey beers on startup.
- `recommender.py` — Core recommendation logic: data loading, profile building, similarity scoring, diversity filtering.
- `vectors.py` — Composite vector builders for catalog beers (`build_composite_vectors`) and survey beers (`build_survey_vectors`), plus style-family mapping.
- `elo.py` — Elo math, comparison replay, matchup selection (survey and post-review), and backend calls for Elo scores, survey beers, and comparisons.
- `classes.py` — Pydantic DTOs.
- `data/` — Local CSV exports.
- `scripts/compare_recs.py` — Read-only check of how much `/live-recs` changes between old and new vectors. Run before deploying vector changes.

## How It Works Today

1. Catalog beers get composite vectors: one-hot flavor tags + style family + ABV/IBU on fixed scales (`ABV_SCALE = 0.15` since ABV is a fraction, `IBU_SCALE = 150`), with missing values filled by style → family → catalog median (`build_composite_vectors()`). Survey beers use the same scales and medians (`build_survey_vectors()`).
2. Users compare beers pairwise (cold-start survey of macro beers, then post-review matchups). Each result updates per-user Elo scores.
3. A profile vector is built from Elo scores (`getProfileVector(elo_scores, all_vectors)`): beers above 1500 pull the profile toward them, beers below push it away (0.3× penalty). Survey beer vectors count toward the profile but are never recommended.
4. Recommendations are the highest cosine-similarity catalog beers, excluding already-compared beers, with style diversity enforced (`getLiveRecommendations()` → `addDiversity()`)
5. Users with no Elo scores get a popular-beers fallback (`getPopularBeers()`)

## API Endpoints

- `GET /live-recs/{user_id}` — Main recommendation endpoint. Fetches the user's Elo scores from Spring Boot and returns a personalized (or fallback) beer list.
- `GET /comparisons/next/{user_id}` — Next survey matchup.
- `POST /comparisons/submit/{user_id}` — Submit a comparison result and update Elo.
- `GET /comparisons/post-review/{user_id}` — Matchup pairing a just-reviewed beer against an opponent.
- `GET /reviews/{user_id}` — Proxy to Spring Boot for user review history.
- `GET /debug/{user_id}`, `/debug/vectorizer` — Debug endpoints.
- `GET /preview/beers` — HTML table preview. `GET /export/beers` — CSV download.

## Database

Connects directly to PostgreSQL (same Railway-hosted DB as brew-backend) via SQLAlchemy. On startup, `loadData()` reads only the catalog:

- `bootstrapped_beers` + `bootstrapped_beer_flavor_tags` → beer catalog

`imported_beers` is **not** used: it's the raw Kaggle dataset and `brewery_uuid` is null on every row.

Also reads `user_comparisons` (Elo replay) and `user_reviews` (post-review matchups) directly. Survey beers and Elo scores come through the backend API.

## Architecture Context

- The frontend (brew-frontend on Vercel) calls this service directly for recommendations via `VITE_RECOMMENDATION_BASE_URL`.
- This service calls Spring Boot (`SPRING_BOOT_BASE_URL`) for Elo scores, survey beers, comparisons, and reviews. It does not accept auth tokens directly.
- Beer data is loaded once on startup and held in memory as DataFrames. Survey beers load in the background with retries; endpoints that need them call `ensure_survey_loaded()`, which retries on demand (10s cooldown).

## Status

The Elo pairwise-comparison refactor (`docs/refactor-scope.md`) is **complete** and merged to `main` (May 2026). Current feature work is the Brewery Crawl Generator; see `docs/crawl-scope.md` at the repo root.

## Conventions

- Python 3.11+, no type: ignore comments — fix types properly
- UUIDs are strings in DataFrames, UUID objects in API layer
- All beer serialization goes through `serialize_beers()` for consistent output shape
- The `addDiversity()` function must always wrap final recommendation output to ensure style variety
