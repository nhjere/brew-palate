package com.codewithneal.brew_backend.CsvReader.beers;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface BeerCsvRepository extends JpaRepository<BeerCsv, UUID> {
    
    List<BeerCsv> findByBreweryUuid(UUID breweryUuid);
    List<BeerCsv> findByBreweryUuidIn(List<UUID> breweryUuids);

    @Query("SELECT b.flavorTags FROM BeerCsv b")
    List<List<String>> findAllFlavorTags();

    // Find unique flavor tags
    @Query(value = """
        SELECT DISTINCT LOWER(ft.flavor_tag)
        FROM bootstrapped_beer_flavor_tags ft
        WHERE ft.flavor_tag IS NOT NULL AND ft.flavor_tag <> ''
        ORDER BY LOWER(ft.flavor_tag)
        """, nativeQuery = true)
    List<String> findAllUniqueFlavorTags();

    // BeerCsvRepository.java
    // BeerCsvRepository.java
    @Query(value = """
        SELECT style
        FROM (
            SELECT DISTINCT TRIM(style) AS style
            FROM bootstrapped_beers
            WHERE style IS NOT NULL AND TRIM(style) <> ''
        ) s
        ORDER BY LOWER(style)
        """, nativeQuery = true)
    List<String> findAllUniqueStyles();



    // A) Nearby only
    @Query(value = """
        WITH nearby AS (
        SELECT bp.brewery_id,
                ST_Distance(bp.geog, ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography) AS dist_m
        FROM brewery_profiles bp
        WHERE ST_DWithin(bp.geog, ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography, :radiusMeters)
        )
        SELECT
        b.beer_id        AS "beerId",
        b.name           AS "name",
        b.abv            AS "abv",
        b.ibu            AS "ibu",
        b.style          AS "style",
        b.brewery_uuid   AS "breweryUuid",
        (n.dist_m / 1609.344) AS "distanceMiles",
        COALESCE(ARRAY_AGG(DISTINCT ft.flavor_tag)
                FILTER (WHERE ft.flavor_tag IS NOT NULL), '{}') AS "flavorTags"
        FROM bootstrapped_beers b
        JOIN nearby n ON n.brewery_id = b.brewery_uuid
        LEFT JOIN bootstrapped_beer_flavor_tags ft ON ft.beer_id = b.beer_id
        GROUP BY b.beer_id, b.name, b.abv, b.ibu, b.style, b.brewery_uuid, n.dist_m
        ORDER BY n.dist_m ASC
        """,
        countQuery = """
        WITH nearby AS (
        SELECT bp.brewery_id
        FROM brewery_profiles bp
        WHERE ST_DWithin(bp.geog, ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography, :radiusMeters)
        )
        SELECT COUNT(*)
        FROM bootstrapped_beers b
        JOIN nearby n ON n.brewery_id = b.brewery_uuid
        """,
        nativeQuery = true)
    Page<BeerListItem> findNearbyList(
    @Param("lat") double lat,
    @Param("lng") double lng,
    @Param("radiusMeters") double radiusMeters,
    Pageable pageable);



    // B) Nearby with any selected tags
    @Query(value = """
        WITH nearby AS (
        SELECT bp.brewery_id,
                ST_Distance(bp.geog, ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography) AS dist_m
        FROM brewery_profiles bp
        WHERE ST_DWithin(bp.geog, ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography, :radiusMeters)
        )
        SELECT
        b.beer_id        AS "beerId",
        b.name           AS "name",
        b.abv            AS "abv",
        b.ibu            AS "ibu",
        b.style          AS "style",
        b.brewery_uuid   AS "breweryUuid",
        (MIN(n.dist_m) / 1609.344) AS "distanceMiles",
        COALESCE(ARRAY_AGG(DISTINCT ft2.flavor_tag)
                FILTER (WHERE ft2.flavor_tag IS NOT NULL), '{}') AS "flavorTags"
        FROM bootstrapped_beers b
        JOIN nearby n ON n.brewery_id = b.brewery_uuid
        JOIN bootstrapped_beer_flavor_tags ft ON ft.beer_id = b.beer_id
        LEFT JOIN bootstrapped_beer_flavor_tags ft2 ON ft2.beer_id = b.beer_id
        WHERE lower(ft.flavor_tag) = ANY(:tags)
        GROUP BY b.beer_id, b.name, b.abv, b.ibu, b.style, b.brewery_uuid
        ORDER BY MIN(n.dist_m) ASC
        """,
        countQuery = """
        WITH nearby AS (
        SELECT bp.brewery_id
        FROM brewery_profiles bp
        WHERE ST_DWithin(bp.geog, ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography, :radiusMeters)
        )
        SELECT COUNT(DISTINCT b.beer_id)
        FROM bootstrapped_beers b
        JOIN nearby n ON n.brewery_id = b.brewery_uuid
        JOIN bootstrapped_beer_flavor_tags ft ON ft.beer_id = b.beer_id
        WHERE lower(ft.flavor_tag) = ANY(:tags)
        """,
        nativeQuery = true)
    Page<BeerListItem> findNearbyWithAnyTagsList(
    @Param("lat") double lat,
    @Param("lng") double lng,
    @Param("radiusMeters") double radiusMeters,
    @Param("tags") String[] tags,
    Pageable pageable);



    // C) Tags-only (no location)
    @Query(value = """
        SELECT
        b.beer_id      AS "beerId",
        b.name         AS "name",
        b.abv          AS "abv",
        b.ibu          AS "ibu",
        b.style        AS "style",
        b.brewery_uuid AS "breweryUuid",
        NULL::double precision AS "distanceMiles",
        COALESCE(ARRAY_AGG(DISTINCT ft2.flavor_tag)
                FILTER (WHERE ft2.flavor_tag IS NOT NULL), '{}') AS "flavorTags"
        FROM bootstrapped_beers b
        JOIN bootstrapped_beer_flavor_tags ft ON ft.beer_id = b.beer_id
        LEFT JOIN bootstrapped_beer_flavor_tags ft2 ON ft2.beer_id = b.beer_id
        WHERE lower(ft.flavor_tag) = ANY(:tags)
        GROUP BY b.beer_id, b.name, b.abv, b.ibu, b.style, b.brewery_uuid
        """,
        countQuery = """
        SELECT COUNT(DISTINCT b.beer_id)
        FROM bootstrapped_beers b
        JOIN bootstrapped_beer_flavor_tags ft ON ft.beer_id = b.beer_id
        WHERE lower(ft.flavor_tag) = ANY(:tags)
        """,
        nativeQuery = true)
    Page<BeerListItem> findByAnyTagsList(
    @Param("tags") String[] tags,
    Pageable pageable);


    // D: all beers (no filters)

    @Query(value = """
        SELECT
        b.beer_id      AS "beerId",
        b.name         AS "name",
        b.abv          AS "abv",
        b.ibu          AS "ibu",
        b.style        AS "style",
        b.brewery_uuid AS "breweryUuid",
        NULL::double precision AS "distanceMiles",
        COALESCE(ARRAY_AGG(DISTINCT ft.flavor_tag)
                FILTER (WHERE ft.flavor_tag IS NOT NULL), '{}') AS "flavorTags"
        FROM bootstrapped_beers b
        LEFT JOIN bootstrapped_beer_flavor_tags ft ON ft.beer_id = b.beer_id
        GROUP BY b.beer_id, b.name, b.abv, b.ibu, b.style, b.brewery_uuid
        ORDER BY b.name ASC
        """,
        countQuery = """
        SELECT COUNT(*) FROM bootstrapped_beers
        """,
        nativeQuery = true)
    Page<BeerListItem> findAllList(Pageable pageable);

}