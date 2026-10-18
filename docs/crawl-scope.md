# BrewPalate — Brewery Crawl Generator (MVP)

Scope doc for the crawl generator. Lives at `docs/crawl-scope.md` in the `brew-palate` repo and is imported from the root `CLAUDE.md`. The root and per-folder `CLAUDE.md` files still apply for repo-specific conventions.

Items marked **(default)** were proposed but not explicitly confirmed. Ask Neal before deviating from them, and don't treat them as settled if he pushes back.

---

## What the feature does

A user picks Austin or Chicago, enters a start address (or uses their location), chooses 2–5 stops and a travel mode, and gets a one-way brewery route on a map. Each stop shows either:

- **BrewPalate picks:** 2–3 catalogued beers from that brewery, ranked by the user's Elo taste profile, or
- **Style suggestion:** for breweries with no catalogued beers, a personalized style tip (e.g. "Look for an IPA") with a one-line reason drawn from the user's comparisons.

The design must keep working as breweries claim accounts and add menus. A stop switches from a style suggestion to named beers automatically when the brewery has beers, with no crawl code changes.

---

## Locked decisions

- **Scope:** solo crawls only. Groups are P1.
- **Cities:** Austin and Chicago only (beta allowlist). The start point must be within 50 mi of the city center.
  - Austin center: `(-97.7431, 30.2672)`, 39 open breweries within 50 mi, 5 with catalogued beers
  - Chicago center: `(-87.6298, 41.8781)`, 126 open breweries within 50 mi, 11 with catalogued beers
- **Travel modes:** `rideshare` (primary, default) and `walk` (secondary; can be cut if it causes problems). No driving or bike modes.
- **Crawl radius from the start point:** rideshare 10 mi, walk 3 mi. The 50 mi figure is the *start zone*, not the crawl size.
- **Stops:** 2–5. Route is one-way from the start (no loop back).
- **Brewery filter:** exclude only `brewery_type IN ('planning', 'closed')`. Keep everything else, including `proprietor`.
- **Beer data:** only `bootstrapped_beers`, joined via `brewery_uuid = brewery_profiles.brewery_id`. Never use `imported_beers`, which isn't linked to any brewery.
- **Catalogued-stop rule:** every crawl includes at least one brewery with catalogued beers whenever one is within the crawl radius.
- **Survey required:** a user with no usable Elo profile can't generate a crawl and is prompted the onboarding survey pop up that they can complete within the brewery crawl page.
- **No persistence in MVP:** no `user_crawls` table and no DB writes. The crawl is reproducible from URL params plus a seed.
- **Year variants:** leave them as they are (e.g. "Double Haul IPA (2009)"). Don't dedupe.
- **Favorites at a stop (default):** include beers the user already ranked highly (Elo > 1500), labeled "Your favorite," max 1 per stop. Exclude beers they ranked below 1500.
- **Page:** a new page at `/user/crawl`, separate from Find Breweries. It reuses the `BreweryMap` component.

---

## Architecture

```
brew-frontend (Vercel)                        brew-recommender (FastAPI, Railway)
BreweryCrawl.jsx
  ├─ Mapbox Geocoding (client) ──> start lat/lng
  ├─ POST /crawl/generate  (Bearer JWT) ───────> crawl/router.py
  │                                                 ├─ verify Supabase JWT → user_id
  │                                                 ├─ fetch_elo_scores(user_id)  (existing, via backend)
  │                                                 ├─ getProfileVector(...)      (existing, recommender.py)
  │                                                 ├─ PostGIS candidate query    (direct DB, SQLAlchemy engine)
  │                                                 ├─ score → select → order → per-stop recs
  │                  <──────── ordered stops JSON ──┘
  └─ Mapbox Directions (client, driving|walking) ──> route line + per-leg times
```

- Crawl logic lives in **brew-recommender**, next to the vectors and scoring it reuses. **brew-backend needs no changes** for the MVP.
- Routing (Directions API) runs in the browser, where the Mapbox token and integration already are. The backend decides which stops and in what order; Mapbox draws the street path and gives leg times.
- The crawl makes read-only DB queries only. There's one shared Railway DB with no dev/prod separation, so **no migrations and no writes** in this feature.

---

## Prerequisites (do these first, in order)

### Session 0a: repo hygiene
- Delete `brew-recommender/data/beer_pool.csv`. Confirmed nothing reads it: the only `grep` hits were a stale `.pyc` and outdated docs.
- Delete `brew-recommender/__pycache__/` and add `__pycache__/` to `.gitignore`. Check `git ls-files | grep pycache` and `git rm --cached` anything that was committed.
- Fix `brew-backend/CLAUDE.md`:
  - Lines ~34 and ~74 reference a `beer_pool` table. The `BeerCsv` entity maps to `bootstrapped_beers`.
  - Line ~74 also lists `beer_flavor_tags` and `breweries`. Correct these to the real table names; check the JPA entities.
- Fix the root `CLAUDE.md` (Recommender and Backend sections):
  - "TF-IDF vectorization … profile built from beers rated >= 4" is outdated. It's now composite vectors with an Elo-weighted profile (`getProfileVector(elo_scores, all_vectors)`).
  - "unions `bootstrapped_beers`/`imported_beers`" is wrong. `loadData()` reads only `bootstrapped_beers`.
  - "`imported_beers` (from external APIs)" is wrong. It's the raw Kaggle dataset and isn't linked to breweries.
- Fix `brew-recommender/CLAUDE.md`: it says `imported_beers` is combined with the catalog. It isn't. `loadData()` reads only `bootstrapped_beers`, and `imported_beers.brewery_uuid` is null on every row.

### Session 0b: vector fixes (`brew-recommender/vectors.py`) — DONE 2026-10-18 (also fixed survey `styleFamily` key; mean top-20 overlap 81% scale+fill only, 57% with family fix; approved by Neal)
Two bugs, fixed together and measured together:

1. **ABV/IBU scaling mismatch.** Catalog ABV and survey ABV are *both stored as fractions* (catalog `0.075`, survey Guinness `0.042`).
   - Catalog vectors currently use `abv / abv_max`, but `build_survey_vectors` divides by 15, which assumes percentages. So every survey beer's ABV comes out near 0, and survey-based profiles carry almost no ABV signal.
   - Fix: use shared fixed constants for both builders, e.g. `ABV_SCALE = 0.15` (fraction) and `IBU_SCALE = 150`, clipping to `[0, 1]`.
   - Don't scale by the catalog max: future brewer-added beers would shift every vector.
2. **Missing values treated as 0.** About 564 catalog beers lack IBU and 33 lack ABV. Currently `fillna(0.0)` makes them look like zero-bitterness or zero-alcohol beers.
   - Fix: fill missing values with the median for that exact `style`, falling back to the style family's median, then the whole catalog's median.
   - Compute the medians from the catalog. Apply the same fill to survey beers, falling back by `style_family`.
   - Do this **before** scaling.

Then add `brew-recommender/scripts/compare_recs.py`:
- For every user in `user_elo_scores`, compute the top-20 `/live-recs` list under the old and new vectors. Keep a copy of the old build functions in the script.
- Print each user's top-20 overlap and the mean.
- DB access is read-only.
- Neal reviews the output before deploying (rough bar: mean overlap ≥ 70%, with spot checks that look sensible).

### Session 0c: survey startup resilience (`brew-recommender/main.py`)
- The survey-beer load in `load_survey_data()` must retry with backoff (e.g. 5 attempts, exponential) instead of failing once.
- If `survey_vectors` is still `None` when a request arrives, try one lazy reload.
- The crawl endpoint returns `503 SURVEY_NOT_LOADED` if survey vectors are still unavailable. Never silently fall back to "popular."

---

## Session 1: Supabase JWT auth on FastAPI

Currently FastAPI does **no** auth: any caller can act as any user via `{user_id}` in the path. Fix this for all endpoints, not just the crawl.

**Recommender side:**
- Add `brew-recommender/auth.py` with a FastAPI dependency `get_current_user_id`:
  - Verify HS256 with `SUPABASE_JWT_SECRET`, the same secret Spring Boot uses, and audience `authenticated`.
  - Use PyJWT and return `sub` as the user id.
  - Raise 401 on a missing, expired, or invalid token.
- User-scoped endpoints (`/live-recs/{user_id}`, `/comparisons/next/{user_id}`, `/comparisons/submit/{user_id}`, `/comparisons/post-review/{user_id}`, `/reviews/{user_id}`): keep the path shape for compatibility, but return **403** unless the path `user_id` equals the token `sub`.
- `/crawl/generate`: take the user id from the token only, never from the request body.
- Debug and data-dump endpoints (`/preview/beers`, `/export/beers`, `/debug/vectorizer`, `/dashboard`, `/debug/{user_id}`) **(default)**: disable in production behind an `ENABLE_DEBUG_ENDPOINTS` env flag. Confirm with Neal.
- The existing CORS config already allows all headers, so `Authorization` passes.

**Frontend side:**
- Create one shared axios instance for the recommender, e.g. `src/api/recommenderClient.js`, based on `VITE_RECOMMENDATION_BASE_URL`.
- An interceptor attaches `Authorization: Bearer <access_token>` from `supabase.auth.getSession()`.
- Migrate all existing recommender calls (`/live-recs`, `/comparisons/*`) to this client.

**Deploy order:**
1. Ship the frontend header change first; it's harmless while the recommender ignores the header.
2. Deploy the recommender with enforcement.
3. Verify recommendations and comparisons still work in production.

---

## Session 2: crawl backend (`brew-recommender/crawl/`)

Adapt the file names to repo conventions if they differ.

```
crawl/
  __init__.py
  config.py       # all tunables below
  schemas.py      # Pydantic request/response models
  router.py       # POST /crawl/generate (APIRouter, included in main.py)
  candidates.py   # PostGIS query
  scoring.py      # brewery fit, per-beer scores, favorites
  selection.py    # top-N + catalogued-stop rule + seeded jitter
  ordering.py     # nearest-neighbor from start (haversine)
  fallback.py     # style suggestions
```

### `config.py` tunables
```python
CITY_CENTERS = {"austin": (-97.7431, 30.2672), "chicago": (-87.6298, 41.8781)}  # (lng, lat)
SERVICE_RADIUS_MI = 50
CRAWL_RADIUS_MI = {"rideshare": 10, "walk": 3}
MIN_STOPS, MAX_STOPS = 2, 5
MINUTES_AT_STOP = 45
EXCLUDED_BREWERY_TYPES = ("planning", "closed")
W_FIT, W_PROX = 0.6, 0.4
SEED_JITTER = 0.05
BEERS_PER_STOP = 3
MAX_FAVORITES_PER_STOP = 1
```

### API contract
`POST /crawl/generate`, with auth required.

Request:
```json
{
  "city": "austin",
  "start": { "lat": 30.2651, "lng": -97.7390, "label": "E 6th St, Austin" },
  "stops": 4,
  "mode": "rideshare",
  "seed": 0
}
```

Response:
```json
{
  "city": "austin",
  "mode": "rideshare",
  "start": { "lat": 30.2651, "lng": -97.7390, "label": "E 6th St, Austin" },
  "requestedStops": 4,
  "stops": [
    {
      "order": 1,
      "brewery": {
        "breweryId": "uuid", "name": "...", "breweryType": "micro",
        "street": "...", "city": "...", "state": "...", "websiteUrl": "...",
        "lat": 30.26, "lng": -97.72
      },
      "distanceFromPrevMiles": 1.2,
      "minutesAtStop": 45,
      "recType": "beers",
      "beers": [
        { "beerId": "uuid", "name": "...", "style": "American IPA",
          "abv": 0.068, "ibu": 70, "matchPct": 92, "isFavorite": false }
      ],
      "styleSuggestion": null
    },
    {
      "order": 2,
      "brewery": { "...": "..." },
      "distanceFromPrevMiles": 1.9,
      "minutesAtStop": 45,
      "recType": "style",
      "beers": [],
      "styleSuggestion": {
        "family": "IPA",
        "text": "Look for an IPA, the hoppier end of the menu.",
        "reason": "You've ranked 6 IPAs above average."
      }
    }
  ],
  "warnings": []
}
```

- `distanceFromPrevMiles` is straight-line. The frontend replaces it with Mapbox leg distances and times for display.
- `abv` stays a fraction, as stored in the DB.
- `beers[].isFavorite` means the user's Elo for that beer is above 1500.

**Errors:**

| Status | Code | When |
|---|---|---|
| 400 | `INVALID_PARAMS` | Unknown city or mode, or `stops` outside 2–5 |
| 401 | — | Missing or invalid JWT |
| 409 | `NO_PROFILE` | No Elo scores, or `getProfileVector` returns `None`. The frontend sends the user to the survey |
| 422 | `OUT_OF_SERVICE_AREA` | Start is more than 50 mi from the selected city's center |
| 422 | `NOT_ENOUGH_BREWERIES` | Fewer than 2 candidates in the crawl radius. Include `available` and a hint: switch to rideshare, or move the start |
| 503 | `SURVEY_NOT_LOADED` | Survey vectors unavailable after the lazy reload |

If there are at least 2 candidates but fewer than requested, return what's available and add the warning `ONLY_{k}_BREWERIES_IN_RANGE`.

### Pipeline

1. **Validate.** Check params, then the start's distance to `CITY_CENTERS[city]` against `SERVICE_RADIUS_MI`.
2. **Profile.** Get `elo_scores` via `fetch_elo_scores(user_id)`. Build `all_vectors = concat(beer_vectors, survey_vectors)` and call the existing `getProfileVector(elo_scores, all_vectors)`. It must be the same profile `/live-recs` uses; don't write a second profile function.
3. **Candidates** (`candidates.py`). One query:
   ```sql
   SELECT p.brewery_id, p.<name_col>, p.brewery_type, p.street, p.city, p.state,
          p.<website_col>, p.latitude, p.longitude,
          ST_Distance(p.geog, ST_MakePoint(:lng, :lat)::geography) / 1609.344 AS distance_mi
   FROM brewery_profiles p
   WHERE p.brewery_type NOT IN ('planning', 'closed')
     AND p.geog IS NOT NULL
     AND ST_DWithin(p.geog, ST_MakePoint(:lng, :lat)::geography, :radius_m)
   ```
   - Check the `Brewery` JPA entity for the exact name and website column names; don't guess.
   - The GiST index on `geog` already exists.
   - Get each brewery's catalogued beers from the in-memory `beers_df` (filter on `brewery_uuid`), not a second DB query.
4. **Score** (`scoring.py`).
   - Per beer: cosine similarity between the profile and the beer's vector from `beer_vectors`.
   - Drop beers with Elo < 1500 (disliked).
   - **Brewery fit** for catalogued breweries is the mean of their top-3 beer similarities.
   - **Proximity** is `1 - distance_mi / crawl_radius`.
   - Breweries without catalogued beers get a **neutral fit**: the median fit of catalogued candidates in range. If there are none, score them on proximity alone.
   - `score = W_FIT * fit + W_PROX * proximity`.
5. **Select** (`selection.py`).
   - If `seed > 0`, add a deterministic jitter in `[-SEED_JITTER, +SEED_JITTER]`, derived from `hashlib.sha256(f"{seed}:{brewery_id}")`.
   - Never use Python's `hash()`. It's salted per process, so the same URL would give a different crawl after a restart.
   - Take the top N.
   - **Catalogued-stop rule:** if none of the picks has catalogued beers but a catalogued candidate exists in range, replace the lowest-scoring pick with the best-scoring catalogued candidate.
6. **Order** (`ordering.py`). Nearest-neighbor from the start using haversine. One-way.
7. **Per-stop recs.**
   - **Catalogued stop:** the top `BEERS_PER_STOP` beers by similarity, with at most `MAX_FAVORITES_PER_STOP` favorite (Elo > 1500). `matchPct = round(clip(similarity, 0, 1) * 100)`.
   - **No-beer stop:** a style suggestion (below).

### Style suggestions (`fallback.py`)
- Rank style families by the profile vector's `family_*` components, positive values only, and take the top 3.
- The k-th no-beer stop (0-based, in route order) gets `families[k % len(families)]`, so styles rotate rather than repeat.
- `text` comes from `FAMILY_COPY`. `American` and `Ale` are catch-all families, so for those, build the text from the user's top 2 `tag_*` profile components instead (e.g. "Look for something malty and spiced."), using the copy entry only as a fallback.
- `reason`: count beers in `elo_scores` with Elo > 1500 that belong to that family (via `all_vectors` family columns or `get_style_family`).
  - n ≥ 2: "You've ranked {n} {family} beers above average."
  - Otherwise: "Matches your taste profile."
- Starter copy (Neal can edit):
  ```python
  FAMILY_COPY = {
      "IPA": "Look for an IPA, the hoppier end of the menu.",
      "Stout": "Look for a stout.",
      "Porter": "Look for a porter.",
      "Lager": "Look for a lager, like a Märzen or Vienna lager.",
      "Pilsner": "Look for a pilsner.",
      "Wheat": "Look for a wheat beer, like a hefeweizen or witbier.",
      "Belgian": "Look for a Belgian-style beer, like a saison or tripel.",
      "Amber / Red": "Look for an amber or red ale.",
      "American": "Look for a pale or blonde ale.",
      "Ale": "Ask what's malty and traditional on the menu.",
  }
  ```

### Tests
Add `brew-recommender/tests/crawl/` with pytest covering:
- selection, including the catalogued-stop rule and seed determinism across calls
- nearest-neighbor ordering
- style-family rotation
- the neutral-fit case with no catalogued candidates
- service-area validation
- the JWT dependency

All of these should be pure-function tests with no DB.

---

## Session 3: crawl frontend (`brew-frontend`)

- **Route and nav:** add `/user/crawl` to `App.jsx` and a "Brewery Crawl" item to `UserHeader`.
- **Page:** `src/pages/BreweryCrawl.jsx`.
- **Components** in `src/components/user/crawl/`:
  - `CrawlForm.jsx`: city toggle (Austin/Chicago), start address, "Use my location," stops slider (2–5), and mode toggle (rideshare default, walk). Also the Generate button.
  - `CrawlItinerary.jsx`: summary (stops, total distance, estimated time) plus the stop list.
  - `StopCard.jsx`: shows either the "BrewPalate picks" badge with beers (including a "Your favorite" label) or the "Style suggestion" badge with text and reason.
- **`BreweryMap.jsx`:** add **optional** `stops` (numbered markers) and `route` (GeoJSON LineString drawn via `Source`/`Layer`) props.
  - Find Breweries must render exactly as before when these props are absent.
  - Don't fork the component.
- **Geocoding:** reuse the existing Mapbox geocoding pattern, adding the `proximity` param set to the selected city's center.
  - Validate client-side that the start is within 50 mi before calling the API. The backend check is still the source of truth.
  - "Use my location" uses `navigator.geolocation`. If the location is outside the selected city's zone, show a clear message.
- **Directions:** after `/crawl/generate` returns, call Mapbox Directions with start plus stops in order.
  - Profile `driving` for rideshare, `walking` for walk, with `geometries=geojson`.
  - Use leg distances and durations for display. Total time = sum of legs + `minutesAtStop` × stops.
  - If Directions fails, still show the stops and pins, using straight-line distances.
- **URL state:** keep `city`, `lat`, `lng`, `label`, `stops`, `mode`, and `seed` in the query string. On load, if the params are present, generate automatically.
  - "Regenerate" increments `seed`.
  - "Copy link" copies the current URL.
- **Error states:** map each API error code to friendly copy.
  - `NO_PROFILE` → prompt with a link to the existing onboarding survey.
  - `NOT_ENOUGH_BREWERIES` in walk mode → suggest rideshare.
- **Link from Find Breweries:** add a "Plan a crawl from here" button that passes the current address. Only pass the city when the address is within one of the two service zones.
- **Layout:** mobile-first. Stack the form above the map on narrow screens. Use the existing Tailwind palette from `FindBreweries` and `BeerProximity` (e.g. `#3C547A`, `#445A7D`, `#8C6F52`).
- **API calls:** go through the shared `recommenderClient` from Session 1.

---

## Session 4: end-to-end verification

**Definition of done:**
- Rideshare crawls generate in both Austin and Chicago for every stop count from 2 to 5.
- Every stop shows either catalogued beers or a style suggestion. No empty stops.
- At least 1 catalogued stop whenever one is in range. Verify with starts near known catalogued breweries in both cities.
- The same URL gives the same crawl, including after a recommender restart. Regenerate gives a different crawl where alternatives exist.
- Out-of-zone starts, too few breweries, and missing profiles each show the right message.
- Find Breweries is visually and functionally unchanged.
- Every recommender endpoint rejects a missing or invalid token, and `/live-recs` and comparisons still work from the app.
- The `compare_recs.py` output was reviewed before the Session 0b deploy.
- Server time for `/crawl/generate` is under ~1 s (all scoring is in memory).
- Neal field-tests at least one real crawl in each city.

---

## Out of scope for MVP

- Group crawls and preference merging (P1)
- Saving to a `user_crawls` table and share tokens (P1). URL state covers reopening a crawl for now.
- Swapping or locking individual stops (P1)
- Hours of operation or open-now checks
- Mapbox Optimization API. Nearest-neighbor is enough for 5 stops or fewer.
- Driving and bike modes
- Linking `imported_beers`, and deduping year variants
- Location-aware `/live-recs` (roadmap Phase 5)
- Brewer-added menus. The design just shouldn't block them (see below).
- A tap-list helper (P2 idea)

---

## Known data facts and gotchas

- **ABV is stored as a fraction everywhere** (`0.05` = 5%). Display as a percent in the UI.
- **Catalog coverage:** `brewery_profiles` has 8,412 rows, about 6,056 with coordinates. Only about 219 breweries have both coordinates and catalogued beers, so most stops will get style suggestions. That's expected.
- **`get_style_family()` falls back to `"Ale"` for unknown styles.** Every current catalog style is mapped. Brewer-added styles like "Hazy IPA" would be misclassified, so add a keyword fallback (e.g. "IPA" in the name maps to the IPA family) when brewer menus are built. Don't add it in this MVP.
- **Beer vectors are built once at import** (`loadData()` in `main.py`). New beers need a restart until a refresh mechanism exists; that's needed when brewers can add menus.
- **When brewers can add menus,** put their beers in the same table the crawl reads, with a `source` column, not a parallel table. The crawl's "catalogued beers" check then picks them up automatically.
- **Survey and craft beer ids share the `all_vectors` index.** Craft-only scoring must use `beer_vectors`, as `getLiveRecommendations` does.
- **Shared production DB:** read-only queries only. Neal verifies results in DBeaver between sessions.
- **Don't fix these without asking Neal:**
  - 32 `brewery_profiles` rows (Singapore) have latitude and longitude swapped, which also makes their `geog` wrong.
  - There are duplicate GiST indexes on `geog`: `idx_brewery_geog` and `idx_brewery_profiles_geog`.
  - Neither affects Austin or Chicago.
- **The project-knowledge copy of `recommender.py` is outdated** (reviews-only profile). The repo's Elo-weighted `getProfileVector(elo_scores, all_vectors)` is the real one.
