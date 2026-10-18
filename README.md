# BrewPalate

BrewPalate is a full-stack web platform that connects craft beer enthusiasts and breweries through personalized recommendations, community feedback, and data-driven insights.

The application allows beer lovers to discover and review limited-time releases while giving breweries real-time visibility into customer preferences and pilot batch performance.

---

## Overview

**For Consumers**
- Discover seasonal or small-batch beers nearby.
- Rate and review beers using flavor tags and tasting notes.
- Receive personalized beer recommendations based on review history.
- Follow local breweries and get notified about new releases.
- Track tasting experiences through a personal “BrewLog.”

**For Breweries**
- Post new or upcoming releases directly to the platform.
- Collect and visualize customer feedback for specific batches or recipes.
- Analyze real-time demand trends and flavor preferences.
- Use insights to guide future brewing and distribution decisions.

---

## System Architecture

Frontend (React + Vite + Tailwind)
        ↓
Axios REST API calls
        ↓
Backend (Spring Boot + PostgreSQL + PostGIS)
        ↓
ML Microservice (FastAPI + scikit-learn)
        ↓
Deployment (Vercel + AWS + Supabase Auth)

**Components**

| Layer | Technology | Description |
|-------|-------------|--------------|
| Frontend | React, Vite, TailwindCSS | User interface, routing, and API integration |
| Backend | Spring Boot (Java) | REST APIs, authentication, data validation |
| Database | PostgreSQL + PostGIS | Structured data and spatial queries for breweries |
| Machine Learning | Python, FastAPI, scikit-learn | Content-based recommendation engine |
| Authentication | Supabase | User and brewery login and registration |
| Hosting | AWS, Vercel | Full-stack deployment |

---

## Machine Learning Overview

The BrewPalate recommendation engine uses content-based filtering driven by pairwise comparisons.

- **Beer vectors:** each beer is a composite vector of one-hot flavor tags, style family, and normalized ABV/IBU.
- **Pairwise comparisons:** users pick the better of two beers. New users start with a short cold-start survey of well-known macro beers; after that, reviewing a beer triggers a follow-up matchup.
- **Elo scores:** each comparison updates a per-user Elo score for both beers (baseline 1500).
- **Taste profile:** beers above 1500 pull the user's profile vector toward them, weighted by how far above they are; beers below push it away.
- **Recommendations:** catalog beers are ranked by cosine similarity to the profile, already-compared beers are excluded, and a diversity filter keeps styles varied. Users with no comparisons get a popular-beers fallback.

---

## Installation and Setup

All three services share one PostgreSQL + PostGIS database. Start them in this order: **backend → recommender → frontend**. The recommender fetches survey beers from the backend at startup.

### 1. Clone the Repository
```bash
git clone https://github.com/nhjere/brew-palate.git
cd brew-palate
```

### 2. Backend (Spring Boot, port 8080)
Create `brew-backend/.env` (gitignored; `application.properties` reads these and never holds secrets):
```
DB_URL=jdbc:postgresql://<host>:<port>/<db>?sslmode=require
DB_USERNAME=<user>
DB_PASSWORD=<password>
SUPABASE_JWT_SECRET=<supabase-jwt-secret>
```
In production, set the same variables on the hosting service.
Then run:
```bash
cd brew-backend
./mvnw spring-boot:run
```

### 3. Recommender (FastAPI, port 5001)
Create `brew-recommender/.env`:
```
DB_USER=<user>
DB_PASS=<password>
DB_HOST=<host>
DB_PORT=<port>
DB_NAME=<db>
SPRING_BOOT_BASE_URL=http://localhost:8080
```
Then run:
```bash
cd brew-recommender
python -m venv venv          # first time only
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 5001
```

### 4. Frontend (React + Vite, port 5173)
Create `brew-frontend/.env`:
```
VITE_BACKEND_URL=http://localhost:8080
VITE_RECOMMENDATION_BASE_URL=http://localhost:5001
VITE_SUPABASE_URL=<supabase-project-url>
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
VITE_MAPBOX_TOKEN=<mapbox-token>
```
Then run:
```bash
cd brew-frontend
npm install
npm run dev
```

## API Endpoints (Sample)

Authenticated backend routes expect `Authorization: Bearer <supabase_jwt>`.

**Backend (Spring Boot)**

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/import/beers` | List catalog beers |
| GET | `/api/import/search/beers` | Search beers |
| GET | `/api/brewer/breweries/all` | List breweries |
| GET | `/api/brewer/breweries/nearby` | Breweries near a location (PostGIS) |
| POST | `/api/brewer/breweries/create/beer` | Add a beer (brewery account) |
| POST | `/api/user/reviews` | Submit a review |
| GET | `/api/user/reviews/user/{userId}` | A user's reviews |
| POST | `/api/comparisons` | Record a pairwise comparison |
| GET | `/api/elo/{userId}` | A user's Elo scores |
| GET | `/api/survey-beers` | Cold-start survey beers |

**Recommender (FastAPI)**

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/live-recs/{user_id}` | Personalized recommendations |
| GET | `/comparisons/next/{user_id}` | Next survey matchup |
| POST | `/comparisons/submit/{user_id}` | Submit a matchup result and update Elo |
| GET | `/comparisons/post-review/{user_id}` | Matchup for a just-reviewed beer |

---

## Deployment

| Component | Platform |
|------------|-----------|
| Frontend | Vercel |
| Backend | AWS EC2 / Elastic Beanstalk |
| Database | AWS RDS (PostgreSQL + PostGIS) |
| Recommender Service | Railway / AWS Lambda |
| Authentication | Supabase |

---

## Roadmap

**In progress: Brewery Crawl Generator**
- Pick a city (Austin or Chicago to start), a starting point, 2–5 stops, and a travel mode (rideshare or walking).
- Get a one-way brewery route on a map.
- Each stop shows the beers there that best match your Elo taste profile. Breweries with no beers catalogued yet get a personalized style tip instead (e.g. "Look for an IPA").
- Stops switch from style tips to named beers automatically as breweries add their menus.
- Planned later: group crawls.

**Later**
- Add a brewery analytics dashboard with D3.js visualizations.
- Integrate an LLM-powered “Beer Assistant” for natural language recommendations.

---

## Author

**Neal Jere**  
Texas Ex, B.S. Mechanical Engineering with a Robotics Minor
Focus: Full-Stack Development, Machine Learning, Systems Design  
[LinkedIn](https://www.linkedin.com/in/neal-jere/)

---

## License

This project is licensed under the MIT License. You are free to fork and modify it for educational or personal use.

---

## Demo

BrewPalate: connecting craft beer enthusiasts and breweries through data-driven taste.
