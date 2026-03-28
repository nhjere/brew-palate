# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (brew-frontend/)
```bash
cd brew-frontend
npm install
npm run dev          # Vite dev server on :5173
npm run build        # Production build
npm run lint         # ESLint
```

### Backend (brew-backend/)
```bash
cd brew-backend
./mvnw spring-boot:run                    # Run on :8080
./mvnw package -DskipTests               # Build JAR
java -jar target/brew-backend-0.0.1-SNAPSHOT.jar  # Run built JAR
```

### Recommender (brew-recommender/)
```bash
cd brew-recommender
source venv/bin/activate
uvicorn main:app --reload --port 5001    # FastAPI dev server
```

## Architecture

Three-service platform connecting beer enthusiasts with breweries:

```
React Frontend (Vercel, :5173)
  ├── Axios → Spring Boot Backend (Railway, :8080)
  │              └── PostgreSQL + PostGIS (Railway :42070)
  └── Axios → FastAPI Recommender (Railway, :5001 local)
                 ├── Reads DB directly via SQLAlchemy
                 └── Calls Backend for live user reviews
```

All three services share one PostgreSQL database on Railway (`turntable.proxy.rlwy.net:42070/railway`).

### Authentication Flow
Supabase handles auth. Frontend gets JWT from Supabase, sends it as `Authorization: Bearer` header. Backend validates with HMAC256 using Supabase JWT secret. User profiles are lazily created on first API call (`getOrCreateUser`). Guest mode uses `supabase.auth.signInAnonymously()` with `X-BP-Guest: 1` header.

### Frontend (React 19 + Vite + Tailwind 4)
- **Routing**: React Router 7 with dual role paths (`/user/*` and `/brewer/*`)
- **State**: Context API + localStorage (no Redux). `BreweryProvider` caches all breweries; `BrewerProvider` manages brewer session.
- **API calls**: Axios with base URLs from `VITE_BACKEND_URL` and `VITE_RECOMMENDATION_BASE_URL` env vars
- **Maps**: Mapbox GL for brewery geolocation

### Backend (Spring Boot 3 + Java 21)
- **Package structure**: `user` (profiles, reviews, friends, follows) and `brewer` (breweries, beers, analytics) packages under `com.codewithneal.brew_backend`
- **Key services**: `JwtService` (Supabase token validation), `UserService`, `ReviewService`, `GeocodingService` (Nominatim OSM → lat/lon), `FriendSuggestionService`
- **Beer data**: Two sources — `bootstrapped_beers` (seed data) and `imported_beers` (from external APIs). Flavor tags stored as `@ElementCollection`.
- **Beer operations**: `@Transactional` to keep flavor tag ElementCollection in sync
- **Config**: `application.properties` has DB URL, Supabase JWT secret, port via `${PORT:8080}`

### Recommender (FastAPI + scikit-learn)
- **Algorithm**: TF-IDF vectorization on beer flavor tags → cosine similarity against user profile vector (built from beers rated >= 4)
- **Fallback**: If user has insufficient reviews, returns popular beers with diversity algorithm
- **Data loading**: Queries DB at startup — unions `bootstrapped_beers`/`imported_beers` and their flavor tag tables
- **Calls backend**: `GET /api/user/reviews/user/{user_id}` via httpx for live user reviews
- **CORS**: Allows `https://*.vercel.app` and `http://localhost:5173`

## Database

Shared PostgreSQL with PostGIS. Key application tables:
- `user_profiles`, `user_reviews`, `user_follows`
- `bootstrapped_beers`, `bootstrapped_beer_flavor_tags` (seed data)
- `imported_beers`, `imported_beer_flavor_tags` (external imports)
- `brewery_profiles` (with lat/lon from geocoding)
- `review_flavor_tags`

Backend manages schema via Hibernate `ddl-auto=update`. Recommender reads directly with raw SQL.

## Environment Variables

**Frontend** (`.env`): `VITE_BACKEND_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_MAPBOX_TOKEN`, `VITE_RECOMMENDATION_BASE_URL`

**Backend** (`application.properties`): DB connection, Supabase JWT secret, `PORT`

**Recommender** (`.env`): `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `SPRING_BOOT_BASE_URL`
