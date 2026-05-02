-- Migration: Add pairwise comparison tables for Elo-based recommendation engine
-- Note: Hibernate ddl-auto=update will create these tables automatically from JPA entities.
-- This script is provided for documentation and manual execution if needed.

-- Curated reference beers for cold-start survey (~15-20 mainstream brands)
CREATE TABLE IF NOT EXISTS survey_beers (
    survey_beer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    style VARCHAR(100),
    style_family VARCHAR(50),
    abv DOUBLE PRECISION,
    ibu DOUBLE PRECISION,
    image_url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS survey_beer_flavor_tags (
    survey_beer_id UUID NOT NULL REFERENCES survey_beers(survey_beer_id) ON DELETE CASCADE,
    flavor_tag VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS survey_beer_feature_vector (
    survey_beer_id UUID NOT NULL REFERENCES survey_beers(survey_beer_id) ON DELETE CASCADE,
    value DOUBLE PRECISION
);

-- Every pairwise comparison a user makes (survey or organic)
CREATE TABLE IF NOT EXISTS user_comparisons (
    comparison_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    beer_a_id UUID NOT NULL,
    beer_b_id UUID NOT NULL,
    winner_id UUID NOT NULL,
    context VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_comparisons_user_id ON user_comparisons(user_id);

-- Materialized per-user, per-beer Elo ratings
CREATE TABLE IF NOT EXISTS user_elo_scores (
    elo_score_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    beer_id UUID NOT NULL,
    score DOUBLE PRECISION NOT NULL DEFAULT 1500.0,
    comparison_count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, beer_id)
);

CREATE INDEX IF NOT EXISTS idx_user_elo_scores_user_id ON user_elo_scores(user_id);
