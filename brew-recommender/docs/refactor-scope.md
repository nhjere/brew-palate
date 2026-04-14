# Brew-Recommender Refactor: Project Scope

## What We're Building

A pairwise comparison recommendation engine that replaces the current rating-based system. Instead of asking users "how much did you like this beer?" (1–5 stars), the system asks "which of these two beers do you prefer?" and uses the pattern of choices to learn what a user likes.

This approach produces higher quality signal — people are inconsistent with star ratings but very reliable when picking between two options.

---

## Why the Current System Falls Short

The existing recommender builds a user profile by looking at beers rated 4+ stars, grabbing their TF-IDF flavor tag vectors, and averaging them together. Three problems:

1. **Cold start** — New users and guests have no reviews, so they get generic "popular beers" recommendations with no personalization.
2. **Thin vectors** — Beers are represented only by flavor tags via TF-IDF. Many beers share identical tag sets, so the system can't distinguish between them.
3. **Wasted data** — Four of the five rating dimensions (`flavorBalance`, `mouthfeelQuality`, `aromaIntensity`, `finishQuality`) are collected but never used.

---

## The New System at a Glance

### Cold-Start Survey (New Users & Guests)

When a user first arrives — whether they register or continue as guest — they're offered a short optional survey: 8–10 rounds of "Which do you prefer?" using well-known mainstream brands (Guinness, Lone Star, Stella Artois, Blue Moon, Shiner Bock, Modelo, etc.).

These survey beers don't live in the craft beer pool. They exist in a small reference table (`survey_beers`, ~15–20 entries) with hand-assigned feature vectors matching the same dimensions used for craft beers. After the survey, the user's choices generate an initial preference profile that immediately powers personalized recommendations from the actual craft beer catalog.

Guest users participate through their existing anonymous Supabase UUID. If they later create an account, their survey data carries over.

### Richer Beer Vectors

Every beer gets a composite feature vector built from multiple dimensions instead of just flavor tags:

- **Flavor tags** — one-hot encoded (binary: has tag or doesn't)
- **Style family** — styles grouped into ~10–15 families (IPA family, stout family, lager family, etc.)
- **ABV & IBU** — normalized numeric features

This ensures that two IPAs with the same flavor tags but different ABVs are represented as distinct points in the vector space.

### Elo Scoring

Each pairwise comparison updates per-user Elo scores for both beers involved. Beers that consistently "win" comparisons accumulate high scores; beers that lose drop. The Elo scores then weight the beer vectors when computing the user's taste profile — winners pull the profile toward their region of the flavor space, losers push it away (built-in negative signal).

### Profile Vector → Recommendations

The user's profile vector (weighted average of beer vectors, weighted by Elo) feeds into the same cosine similarity pipeline that exists today. Beers closest to the user's profile in the vector space get recommended, with diversity logic ensuring style variety in results.

---

## What Changes Where

### Database (PostgreSQL)
- New table: `survey_beers` — curated reference beers with hand-assigned vectors
- New table: `user_comparisons` — stores every pairwise choice (who compared what, who won, what context)
- New table: `user_elo_scores` — materialized per-user, per-beer Elo ratings

### Backend (Spring Boot)
- New endpoints for submitting comparisons, fetching comparison history, and checking onboarding status
- No changes to existing review endpoints — reviews and comparisons coexist as parallel signal sources

### Recommender (Python / FastAPI)
- Replace TF-IDF vectorization with composite vector construction
- Add Elo scoring logic
- Add matchup selection endpoint (serves the next pair of beers to compare)
- Modify profile vector computation to use Elo-weighted vectors instead of (or blended with) review-weighted vectors

### Frontend (React)
- New comparison card UI component (two beers side by side, tap to pick)
- Onboarding flow wrapping the comparison card in a progress stepper
- Integration into the existing guest flow

---

## What Stays the Same

- The existing review system (5-dimension ratings, flavor tags, comments) remains fully functional
- Brewery-facing analytics dashboards are unaffected
- Auth flow, guest login, and Supabase integration are unchanged
- The recommendation API contract (`GET /recommend/{user_id}`) stays the same — the downstream response shape doesn't change, only how results are computed

---

## Sequencing

**Phase 1 — Foundation**: Composite beer vectors + database schema (survey_beers, user_comparisons, user_elo_scores). This is backend-only, no UI yet.

**Phase 2 — Cold-start survey**: Survey beer curation, onboarding comparison UI, and the profile vector pipeline from survey choices → Elo → recommendations.

**Phase 3 — Ongoing comparisons**: Post-review comparison prompts and organic comparison browsing for returning users who want to refine their profile over time.
