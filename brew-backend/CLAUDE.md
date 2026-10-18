# brew-backend

Spring Boot REST API for BrewPalate. Handles authentication, user/brewery management, reviews, beer catalog, analytics, and serves as the persistence layer for the entire platform.

## Run Locally

```bash
./mvnw spring-boot:run
```

Requires env vars `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `SUPABASE_URL` (plus optional legacy `SUPABASE_JWT_SECRET`), read by `application.properties`. Locally, put them in `brew-backend/.env` (gitignored; loaded via `spring.config.import`, so run from `brew-backend/`). In prod they're Railway service variables. Never hard-code secrets in `application.properties`; it's committed.

## Tech Stack

- Java 21, Spring Boot 3.4.5, Spring Data JPA
- PostgreSQL + PostGIS (hosted on Railway)
- Supabase JWT auth (verified server-side via `com.auth0:java-jwt`)
- Maven build, packaged as `app.jar`

## Project Structure

```
src/main/java/com/codewithneal/brew_backend/
├── user/
│   ├── controller/    UserController, UserReviewController, UserFollowController, FriendSuggestionsController
│   ├── model/         User, Review, UserFollow
│   ├── dto/           UserRegistrationDTO, ReviewDTO, ReviewMinimalDTO, FriendSuggestionDto
│   ├── repository/    UserRepository, ReviewRepository, UserFollowRepository
│   └── service/       UserService, ReviewService, FriendSuggestionService
├── brewer/
│   ├── controller/    BreweryController, AnalyticsController
│   ├── model/         Brewery
│   └── repository/    BreweryRepository
├── CsvReader/beers/   BeerCsv entity + BeerCsvRepository (bootstrapped_beers table)
├── JwtService.java    Shared JWT verification utility
├── WebConfig.java     CORS configuration
└── GeocodingService   Geocodes brewery addresses for PostGIS
```

## Key API Routes

**User:**
- `GET /api/user/me` — Auth check, returns or creates user profile (supports guest via `X-BP-Guest` header)
- `GET /api/user/profile` — Returns user profile data
- `PATCH /api/user/profile/update` — Update profile (blocked for guests)
- `GET /api/user/suggestions` — Friend suggestions

**Reviews:**
- `POST /api/user/reviews` — Submit a review
- `GET /api/user/reviews` — All reviews
- `GET /api/user/reviews/user/{userId}` — User's reviews (called by brew-recommender)

**Breweries:**
- `POST /api/brewer/breweries/create` — Create brewery (sets user.hasBrewery)
- `PATCH /api/brewer/breweries/update` — Update brewery
- `GET /api/brewer/breweries/status` — Brewery ownership status
- `POST /api/brewer/breweries/details` — Bulk brewery lookup by UUIDs

**Analytics:**
- `GET /api/analytics/brewery-dashboard` — Full brewery analytics with beer-level review breakdowns
- `GET /api/analytics/brewery-stats` — Lightweight stats overview

**Follows:**
- `POST /api/user/follows` — Follow a brewery
- `GET /api/user/follows/{userId}` — List followed breweries
- `DELETE /api/user/follows` — Unfollow

## Auth Pattern

All authenticated endpoints expect `Authorization: Bearer <supabase_jwt>`. Token is verified via `JwtService.requireUserId(authHeader)` which decodes the JWT and extracts the Supabase user UUID from the `sub` claim. Guest users are identified by the `X-BP-Guest: 1` header and have restricted permissions (can't update profile).

## Database

PostgreSQL on Railway. Key tables: `user_profiles`, `user_reviews`, `review_flavor_tags`, `bootstrapped_beers`, `bootstrapped_beer_flavor_tags`, `brewery_profiles`, `user_follows`, `user_comparisons`, `user_elo_scores`, `survey_beers` (+ `survey_beer_flavor_tags`, `survey_beer_feature_vector`). PostGIS extension enabled for brewery geolocation queries.

## Architecture Context

- Frontend (brew-frontend) calls this service via `VITE_BACKEND_URL`
- Recommender (brew-recommender) calls `GET /api/user/reviews/user/{userId}` to fetch review data for recommendations
- This service does NOT call the recommender — the frontend calls the recommender directly

## Pairwise Comparison Layer (complete)

Persistence layer for the pairwise comparison recommendation engine, merged May 2026. Current feature work is the Brewery Crawl Generator; see `docs/crawl-scope.md` at the repo root. The comparison layer added:

- New tables: `survey_beers`, `user_comparisons`, `user_elo_scores`
- New endpoints: `POST /api/comparisons`, `GET /api/comparisons/history`, `GET /api/user/onboarding-status`
- New JPA entities, repositories, DTOs, and service class for comparison logic
- No changes to existing review endpoints — reviews and comparisons coexist

See `brew-recommender/docs/refactor-scope.md` for the full plan.

## Conventions

- Controllers handle auth + request/response mapping only — business logic lives in services
- DTOs for all API boundaries, entities for persistence
- UUIDs for all primary keys
- Follow existing patterns: `JwtService` for auth, `ResponseEntity` returns, `Map.of()` for error bodies
- CORS allows `*.vercel.app` and `localhost:5173`
