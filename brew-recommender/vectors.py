import numpy as np
import pandas as pd


# Maps every bootstrapped_beers style to one of the 10 style families
# derived from survey_beers.style_family values
STYLE_FAMILY_MAP = {
    # IPA family
    "American Double / Imperial IPA": "IPA",
    "American IPA": "IPA",
    "American White IPA": "IPA",
    "Belgian IPA": "IPA",
    "English India Pale Ale (IPA)": "IPA",
    "IPA": "IPA",

    # Stout family
    "American Double / Imperial Stout": "Stout",
    "American Stout": "Stout",
    "English Stout": "Stout",
    "Foreign / Export Stout": "Stout",
    "Irish Dry Stout": "Stout",
    "Milk / Sweet Stout": "Stout",
    "Oatmeal Stout": "Stout",
    "Russian Imperial Stout": "Stout",

    # Porter family
    "American Porter": "Porter",
    "Baltic Porter": "Porter",

    # Lager family
    "American Adjunct Lager": "Lager",
    "American Amber / Red Lager": "Lager",
    "American Pale Lager": "Lager",
    "Dortmunder / Export Lager": "Lager",
    "Euro Dark Lager": "Lager",
    "Euro Pale Lager": "Lager",
    "Lager": "Lager",
    "Light Lager": "Lager",
    "Munich Dunkel Lager": "Lager",
    "Munich Helles Lager": "Lager",
    "Vienna Lager": "Lager",
    "California Common / Steam Beer": "Lager",
    "Schwarzbier": "Lager",
    "Bock": "Lager",
    "Doppelbock": "Lager",
    "Maibock / Helles Bock": "Lager",
    "Märzen / Oktoberfest": "Lager",
    "Rauchbier": "Lager",

    # Pilsner family
    "American Pilsner": "Pilsner",
    "Czech Pilsener": "Pilsner",
    "German Pilsener": "Pilsner",
    "Keller Bier / Zwickel Bier": "Pilsner",

    # Wheat family
    "American Dark Wheat Ale": "Wheat",
    "American Pale Wheat Ale": "Wheat",
    "Berliner Weissbier": "Wheat",
    "Dunkelweizen": "Wheat",
    "Gose": "Wheat",
    "Hefeweizen": "Wheat",
    "Wheat": "Wheat",
    "Witbier": "Wheat",

    # Belgian family
    "Abbey Single Ale": "Belgian",
    "Belgian": "Belgian",
    "Belgian Dark Ale": "Belgian",
    "Belgian Pale Ale": "Belgian",
    "Belgian Strong Dark Ale": "Belgian",
    "Belgian Strong Pale Ale": "Belgian",
    "Bière de Garde": "Belgian",
    "Dubbel": "Belgian",
    "Quadrupel (Quad)": "Belgian",
    "Saison / Farmhouse Ale": "Belgian",
    "Tripel": "Belgian",

    # Amber / Red family
    "American Amber / Red Ale": "Amber / Red",
    "Irish Red Ale": "Amber / Red",
    "Altbier": "Amber / Red",
    "Extra Special / Strong Bitter (ESB)": "Amber / Red",
    "English Bitter": "Amber / Red",
    "Scottish Ale": "Amber / Red",
    "Scotch Ale / Wee Heavy": "Amber / Red",

    # American family (broad ales and specialty)
    "American Pale Ale (APA)": "American",
    "American Blonde Ale": "American",
    "American Brown Ale": "American",
    "American Black Ale": "American",
    "American Strong Ale": "American",
    "American Barleywine": "American",
    "American Malt Liquor": "American",
    "American Wild Ale": "American",
    "Cream Ale": "American",
    "Kölsch": "American",
    "Low Alcohol Beer": "American",
    "Radler": "American",
    "Shandy": "American",

    # Ale family (English/traditional ales and specialty)
    "Ale": "Ale",
    "English Barleywine": "Ale",
    "English Brown Ale": "Ale",
    "English Dark Mild Ale": "Ale",
    "English Pale Ale": "Ale",
    "English Pale Mild Ale": "Ale",
    "English Strong Ale": "Ale",
    "Old Ale": "Ale",
    "Pumpkin Ale": "Ale",
    "Winter Warmer": "Ale",
    "Rye Beer": "Ale",
    "Roggenbier": "Ale",
    "Smoked Beer": "Ale",
    "Chile Beer": "Ale",
    "Cider": "Ale",
    "Fruit / Vegetable Beer": "Ale",
    "Herbed / Spiced Beer": "Ale",
}

# Canonical order of style families for one-hot encoding
STYLE_FAMILIES = sorted(set(STYLE_FAMILY_MAP.values()))

# Fixed ABV/IBU scales shared by catalog and survey vectors, so both live in
# the same space and adding beers never shifts existing vectors.
# ABV is stored as a fraction (0.05 = 5%), so 0.15 = 15% maps to 1.0.
ABV_SCALE = 0.15
IBU_SCALE = 150.0


def get_style_family(style: str) -> str:
    """Map a beer style to its family. Falls back to 'Ale' for unknown styles."""
    return STYLE_FAMILY_MAP.get(style, "Ale")


def compute_fill_medians(beers_df: pd.DataFrame) -> dict:
    """
    ABV/IBU medians from the catalog, used to fill missing values:
    by exact style, then by style family, then catalog-wide.
    """
    df = pd.DataFrame({
        "style": beers_df["style"].values,
        "family": [get_style_family(s) for s in beers_df["style"]],
        "abv": pd.to_numeric(beers_df["abv"], errors="coerce").values,
        "ibu": pd.to_numeric(beers_df["ibu"], errors="coerce").values,
    })
    return {
        "style": df.groupby("style")[["abv", "ibu"]].median(),
        "family": df.groupby("family")[["abv", "ibu"]].median(),
        "global": df[["abv", "ibu"]].median(),
    }


def _fill_and_scale(values, styles: pd.Series, families: pd.Series, medians: dict, col: str, scale: float) -> np.ndarray:
    """Fill missing values (style → family → global median), then scale to [0, 1]."""
    filled = pd.to_numeric(pd.Series(values), errors="coerce").astype(float)
    filled = filled.fillna(styles.map(medians["style"][col]))
    filled = filled.fillna(families.map(medians["family"][col]))
    filled = filled.fillna(medians["global"][col]).fillna(0.0)
    return np.clip(filled.values / scale, 0.0, 1.0)


def build_composite_vectors(beers_df: pd.DataFrame) -> pd.DataFrame:
    """
    Build composite feature vectors for all beers.

    Vector components:
    - One-hot encoded flavor tags (binary)
    - One-hot encoded style family
    - ABV / ABV_SCALE, clipped to 0-1 (missing values filled with style medians)
    - IBU / IBU_SCALE, clipped to 0-1 (missing values filled with style medians)

    Returns a DataFrame indexed by beer_id with one column per feature dimension.
    """
    # --- Flavor tags: one-hot ---
    all_tags = set()
    for tags in beers_df["flavor_tag"]:
        if isinstance(tags, list):
            all_tags.update(tags)
    all_tags = sorted(all_tags)
    tag_to_idx = {tag: i for i, tag in enumerate(all_tags)}

    tag_matrix = np.zeros((len(beers_df), len(all_tags)))
    for i, tags in enumerate(beers_df["flavor_tag"]):
        if isinstance(tags, list):
            for tag in tags:
                if tag in tag_to_idx:
                    tag_matrix[i, tag_to_idx[tag]] = 1.0

    # --- Style family: one-hot ---
    family_matrix = np.zeros((len(beers_df), len(STYLE_FAMILIES)))
    family_to_idx = {f: i for i, f in enumerate(STYLE_FAMILIES)}
    families = pd.Series([get_style_family(s) for s in beers_df["style"]])
    for i, family in enumerate(families):
        if family in family_to_idx:
            family_matrix[i, family_to_idx[family]] = 1.0

    # --- ABV / IBU: fill missing, then fixed-scale to 0-1 ---
    medians = compute_fill_medians(beers_df)
    styles = pd.Series(beers_df["style"].values)
    abv_norm = _fill_and_scale(beers_df["abv"].values, styles, families, medians, "abv", ABV_SCALE).reshape(-1, 1)
    ibu_norm = _fill_and_scale(beers_df["ibu"].values, styles, families, medians, "ibu", IBU_SCALE).reshape(-1, 1)

    # --- Combine ---
    composite = np.hstack([tag_matrix, family_matrix, abv_norm, ibu_norm])

    # Column names for debugging / introspection
    col_names = (
        [f"tag_{t}" for t in all_tags]
        + [f"family_{f}" for f in STYLE_FAMILIES]
        + ["abv_norm", "ibu_norm"]
    )

    return pd.DataFrame(composite, index=beers_df["beer_id"].values, columns=col_names)


def build_survey_vectors(survey_df: pd.DataFrame, reference_columns: list[str],
                         fill_medians: dict | None = None) -> pd.DataFrame:
    """
    Build composite vectors for survey beers using the same feature space
    as the craft beer catalog.

    reference_columns: column names from the craft beer vector DataFrame,
    so survey vectors are aligned to the same dimensions.
    fill_medians: catalog medians from compute_fill_medians(), used to fill
    missing ABV/IBU. Without them, missing values become 0.
    """
    n = len(survey_df)
    vectors = np.zeros((n, len(reference_columns)))
    col_to_idx = {c: i for i, c in enumerate(reference_columns)}

    styles, families = [], []
    for i, (_, row) in enumerate(survey_df.iterrows()):
        # Flavor tags — check both camelCase (from backend JSON) and snake_case
        tags = row.get("flavorTags", row.get("flavor_tags", [])) or []
        for tag in tags:
            col = f"tag_{tag.lower()}"
            if col in col_to_idx:
                vectors[i, col_to_idx[col]] = 1.0

        # Style family — camelCase from backend JSON, snake_case from DB rows
        family = row.get("styleFamily", row.get("style_family", "")) or ""
        col = f"family_{family}"
        if col in col_to_idx:
            vectors[i, col_to_idx[col]] = 1.0
        styles.append(row.get("style", "") or "")
        families.append(family)

    # ABV / IBU — same fixed scales as craft beers
    if fill_medians is None:
        empty = pd.DataFrame(columns=["abv", "ibu"], dtype=float)
        fill_medians = {"style": empty, "family": empty, "global": pd.Series({"abv": np.nan, "ibu": np.nan})}
    styles, families = pd.Series(styles), pd.Series(families)
    for name, scale in (("abv", ABV_SCALE), ("ibu", IBU_SCALE)):
        values = survey_df[name].values if name in survey_df.columns else [np.nan] * n
        if f"{name}_norm" in col_to_idx:
            vectors[:, col_to_idx[f"{name}_norm"]] = _fill_and_scale(values, styles, families, fill_medians, name, scale)

    beer_id_col = "survey_beer_id" if "survey_beer_id" in survey_df.columns else "surveyBeerId"
    return pd.DataFrame(vectors, index=survey_df[beer_id_col].values, columns=reference_columns)
