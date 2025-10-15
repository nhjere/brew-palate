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

The BrewPalate recommendation engine uses content-based filtering to predict beers a user might enjoy.  
It employs TF-IDF vectorization on flavor tags and reviews, computes similarity scores using cosine similarity, and generates personalized beer suggestions.  
Future work includes integrating an interactive beer recommender chat bot to improve personalization.

---

## Installation and Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/brewpalate.git
cd brewpalate
```

### 2. Backend Setup
```bash
cd backend
./mvnw spring-boot:run
```
Create an `application.properties` file containing:
```
DB_URL=jdbc:postgresql://localhost:5432/brewpalate
DB_USER=postgres
DB_PASSWORD=yourpassword
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Machine Learning Service
```bash
cd recommender
pip install -r requirements.txt
uvicorn main:app --reload
```

## API Endpoints (Sample)

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/beers` | Retrieve all beers |
| POST | `/api/beers` | Add a new beer (brewery access only) |
| GET | `/api/breweries` | List breweries |
| POST | `/api/reviews` | Submit a review |
| GET | `/api/recommendations/{user_id}` | Get personalized recommendations |

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
