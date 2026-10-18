"""
Compare /live-recs output under the old vs new composite vectors (Session 0b).

Read-only: reads bootstrapped_beers and user_elo_scores from the DB and survey
beers from the backend's public GET /api/survey-beers (the same JSON prod uses).

Variants:
  old        vectors as of before Session 0b (frozen copy below)
  scale+fill new ABV/IBU scaling and median fill; survey style family still unset
  new        all Session 0b fixes (also sets survey style family from `styleFamily`)

Usage (from brew-recommender/):
  venv/bin/python scripts/compare_recs.py [--user USER_ID] [--show N]
"""
import argparse
import os
import sys

import httpx
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import text

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from recommender import engine, getLiveRecommendations, loadData, loadSurveyBeers  # noqa: E402
from vectors import STYLE_FAMILIES, compute_fill_medians, get_style_family  # noqa: E402

BACKEND_URL = os.getenv("COMPARE_BACKEND_URL", "https://brew-palate-production.up.railway.app")
TOP_N = 20
CANDIDATES = TOP_N * 5


# --- Frozen pre-0b vector builders (kept only for this comparison) ---

def old_build_composite_vectors(beers_df: pd.DataFrame) -> pd.DataFrame:
    all_tags = sorted({t for tags in beers_df["flavor_tag"] if isinstance(tags, list) for t in tags})
    tag_to_idx = {tag: i for i, tag in enumerate(all_tags)}
    tag_matrix = np.zeros((len(beers_df), len(all_tags)))
    for i, tags in enumerate(beers_df["flavor_tag"]):
        if isinstance(tags, list):
            for tag in tags:
                if tag in tag_to_idx:
                    tag_matrix[i, tag_to_idx[tag]] = 1.0
    family_matrix = np.zeros((len(beers_df), len(STYLE_FAMILIES)))
    family_to_idx = {f: i for i, f in enumerate(STYLE_FAMILIES)}
    for i, style in enumerate(beers_df["style"]):
        family = get_style_family(style)
        if family in family_to_idx:
            family_matrix[i, family_to_idx[family]] = 1.0
    abv = pd.to_numeric(beers_df["abv"], errors="coerce").fillna(0.0).values
    abv_norm = (abv / (abv.max() if abv.max() > 0 else 1.0)).reshape(-1, 1)
    ibu = pd.to_numeric(beers_df["ibu"], errors="coerce").fillna(0.0).values
    ibu_norm = (ibu / (ibu.max() if ibu.max() > 0 else 1.0)).reshape(-1, 1)
    cols = [f"tag_{t}" for t in all_tags] + [f"family_{f}" for f in STYLE_FAMILIES] + ["abv_norm", "ibu_norm"]
    return pd.DataFrame(np.hstack([tag_matrix, family_matrix, abv_norm, ibu_norm]),
                        index=beers_df["beer_id"].values, columns=cols)


def old_build_survey_vectors(survey_df: pd.DataFrame, reference_columns: list[str]) -> pd.DataFrame:
    vectors = np.zeros((len(survey_df), len(reference_columns)))
    col_to_idx = {c: i for i, c in enumerate(reference_columns)}
    for i, (_, row) in enumerate(survey_df.iterrows()):
        for tag in row.get("flavorTags", row.get("flavor_tags", [])) or []:
            if f"tag_{tag.lower()}" in col_to_idx:
                vectors[i, col_to_idx[f"tag_{tag.lower()}"]] = 1.0
        col = f"family_{row.get('style_family', '')}"  # pre-0b bug: JSON key is styleFamily
        if col in col_to_idx:
            vectors[i, col_to_idx[col]] = 1.0
        abv = float(row.get("abv", 0) or 0)
        ibu = float(row.get("ibu", 0) or 0)
        vectors[i, col_to_idx["abv_norm"]] = min(abv / 15.0, 1.0)
        vectors[i, col_to_idx["ibu_norm"]] = min(ibu / 150.0, 1.0)
    return pd.DataFrame(vectors, index=survey_df["surveyBeerId"].astype(str).values, columns=reference_columns)


# --- Helpers ---

def candidate_ids(elo: dict, beer_vectors: pd.DataFrame, survey_vectors: pd.DataFrame) -> list[str]:
    """Top-100 craft beers by raw cosine similarity (before diversity / reordering)."""
    from recommender import getProfileVector
    profile = getProfileVector(elo, pd.concat([beer_vectors, survey_vectors]))
    if profile is None:
        return []
    sims = cosine_similarity([profile], beer_vectors.values)[0]
    ids = beer_vectors.index.tolist()
    ranked = [ids[i] for i in sims.argsort()[::-1] if ids[i] not in elo]
    return ranked[:CANDIDATES]


def overlap(a: list, b: list) -> float:
    return len(set(a) & set(b)) / max(len(a), 1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--user", help="only this user_id")
    ap.add_argument("--show", type=int, default=3, help="print full old/new lists for the N lowest-overlap users")
    args = ap.parse_args()

    beers_df, new_vectors = loadData()
    old_vectors = old_build_composite_vectors(beers_df)
    medians = compute_fill_medians(beers_df)

    survey_json = httpx.get(f"{BACKEND_URL}/api/survey-beers", timeout=30).json()
    survey_df = pd.DataFrame(survey_json)
    survey_df["surveyBeerId"] = survey_df["surveyBeerId"].astype(str)
    old_survey = old_build_survey_vectors(survey_df, old_vectors.columns.tolist())
    _, new_survey = loadSurveyBeers(survey_json, new_vectors.columns.tolist(), medians)
    no_family_json = [{k: v for k, v in b.items() if k != "styleFamily"} for b in survey_json]
    _, scalefill_survey = loadSurveyBeers(no_family_json, new_vectors.columns.tolist(), medians)

    with engine.connect() as conn:
        rows = conn.execute(text("SELECT user_id, beer_id, score FROM user_elo_scores")).fetchall()
    elo_by_user: dict[str, dict[str, float]] = {}
    for user_id, beer_id, score in rows:
        elo_by_user.setdefault(str(user_id), {})[str(beer_id)] = float(score)
    if args.user:
        elo_by_user = {args.user: elo_by_user.get(args.user, {})}

    variants = {
        "old": (old_vectors, old_survey),
        "scale+fill": (new_vectors, scalefill_survey),
        "new": (new_vectors, new_survey),
    }
    names = beers_df.set_index("beer_id")["name"].to_dict()
    survey_names = dict(zip(survey_df["surveyBeerId"], survey_df["name"]))

    results = []
    for user_id, elo in sorted(elo_by_user.items()):
        recs, cands = {}, {}
        for name, (bv, sv) in variants.items():
            recs[name] = getLiveRecommendations(elo, beers_df, bv, sv, num_recs=TOP_N)["beer_id"].astype(str).tolist()
            cands[name] = candidate_ids(elo, bv, sv)
        results.append({
            "user_id": user_id,
            "n_scores": len(elo),
            "top20_scalefill": overlap(recs["old"], recs["scale+fill"]),
            "top20_new": overlap(recs["old"], recs["new"]),
            "cand100_new": overlap(cands["old"], cands["new"]),
            "recs": recs,
            "elo": elo,
        })

    df = pd.DataFrame([{k: v for k, v in r.items() if k not in ("recs", "elo")} for r in results])
    pd.set_option("display.width", 200)
    print(f"\nUsers compared: {len(df)}  (overlap = share of old list still present)\n")
    print(df.sort_values("top20_new").to_string(index=False, float_format=lambda x: f"{x:.0%}"))
    print("\nMEAN overlap vs old:")
    print(f"  top-20, scale+fill only : {df.top20_scalefill.mean():.0%}")
    print(f"  top-20, all 0b fixes    : {df.top20_new.mean():.0%}   (plan's bar: >= 70%)")
    print(f"  top-100 candidates (raw similarity), all fixes: {df.cand100_new.mean():.0%}")

    for r in sorted(results, key=lambda r: r["top20_new"])[: args.show]:
        liked = sorted(r["elo"].items(), key=lambda kv: -kv[1])[:5]
        print(f"\n=== user {r['user_id']}  top-20 overlap {r['top20_new']:.0%}")
        print("  highest Elo:", ", ".join(f"{names.get(b) or survey_names.get(b, b)} ({s:.0f})" for b, s in liked))
        old, new = r["recs"]["old"], r["recs"]["new"]
        print("  dropped:", ", ".join(names.get(b, b) for b in old if b not in new) or "-")
        print("  added:  ", ", ".join(names.get(b, b) for b in new if b not in old) or "-")


if __name__ == "__main__":
    main()
