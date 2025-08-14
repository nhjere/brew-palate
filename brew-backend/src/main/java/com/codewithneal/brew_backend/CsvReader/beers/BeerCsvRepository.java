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

    @Query(
    value = """
        SELECT b.*
        FROM bootstrapped_beers b
        JOIN bootstrapped_beer_flavor_tags ft ON b.beer_id = ft.beer_id
        WHERE ft.flavor_tag IN (:tags)
        GROUP BY b.beer_id
        HAVING COUNT(DISTINCT ft.flavor_tag) = :tagCount
        """,
    countQuery = """
        SELECT COUNT(*)
        FROM (
        SELECT b.beer_id
        FROM bootstrapped_beers b
        JOIN bootstrapped_beer_flavor_tags ft ON b.beer_id = ft.beer_id
        WHERE ft.flavor_tag IN (:tags)
        GROUP BY b.beer_id
        HAVING COUNT(DISTINCT ft.flavor_tag) = :tagCount
        ) matched
        """,
    nativeQuery = true
    )
    Page<BeerCsv> findByAllTags(
    @Param("tags") List<String> tags,
    @Param("tagCount") long tagCount,
    Pageable pageable
    );


    // A) Nearby only (no tags), distance sorted (miles -> meters inside controller)
    @Query(value = """
        SELECT b.*
        FROM bootstrapped_beers b
        JOIN brewery_profiles bp ON bp.brewery_id = b.brewery_uuid
        WHERE ST_DWithin(
        bp.geog,
        ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography,
        :radiusMeters
        )
        ORDER BY ST_Distance(
        bp.geog,
        ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography
        ) ASC
        """,
        countQuery = """
        SELECT COUNT(*)
        FROM bootstrapped_beers b
        JOIN brewery_profiles bp ON bp.brewery_id = b.brewery_uuid
        WHERE ST_DWithin(
        bp.geog,
        ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography,
        :radiusMeters
        )
        """,
        nativeQuery = true)
    Page<BeerCsv> findNearbyOnly(
        @Param("lat") double lat,
        @Param("lng") double lng,
        @Param("radiusMeters") double radiusMeters,
        Pageable pageable);


     // B) Nearby + beer must contain ALL selected tags (AND semantics)
    @Query(value = """
        SELECT b.*
        FROM bootstrapped_beers b
        JOIN (
        SELECT b.beer_id,
                MIN(ST_Distance(
                bp.geog, ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography
                )) AS dist
        FROM bootstrapped_beers b
        JOIN brewery_profiles bp ON bp.brewery_id = b.brewery_uuid
        JOIN bootstrapped_beer_flavor_tags ft ON ft.beer_id = b.beer_id
        WHERE ST_DWithin(
            bp.geog,
            ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography,
            :radiusMeters
        )
        AND ft.flavor_tag = ANY(:tags)
        GROUP BY b.beer_id
        HAVING COUNT(DISTINCT ft.flavor_tag) = :tagCount
        ) s ON s.beer_id = b.beer_id
        ORDER BY s.dist ASC
        """,
        countQuery = """
        SELECT COUNT(*)
        FROM (
        SELECT b.beer_id
        FROM bootstrapped_beers b
        JOIN brewery_profiles bp ON bp.brewery_id = b.brewery_uuid
        JOIN bootstrapped_beer_flavor_tags ft ON ft.beer_id = b.beer_id
        WHERE ST_DWithin(
            bp.geog,
            ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography,
            :radiusMeters
        )
        AND ft.flavor_tag = ANY(:tags)
        GROUP BY b.beer_id
        HAVING COUNT(DISTINCT ft.flavor_tag) = :tagCount
        ) x
        """,
        nativeQuery = true)
    Page<BeerCsv> findNearbyAndByAllTags(
        @Param("lat") double lat,
        @Param("lng") double lng,
        @Param("radiusMeters") double radiusMeters,
        @Param("tags") String[] tags,
        @Param("tagCount") long tagCount,
        Pageable pageable);


    // C) Tags-only (keep this for “no location” case)
    @Query(
        value = """
        SELECT b.*
        FROM bootstrapped_beers b
        JOIN bootstrapped_beer_flavor_tags ft ON b.beer_id = ft.beer_id
        WHERE ft.flavor_tag = ANY(:tags)
        GROUP BY b.beer_id
        HAVING COUNT(DISTINCT ft.flavor_tag) = :tagCount
        """,
        countQuery = """
        SELECT COUNT(*)
        FROM (
            SELECT b.beer_id
            FROM bootstrapped_beers b
            JOIN bootstrapped_beer_flavor_tags ft ON b.beer_id = ft.beer_id
            WHERE ft.flavor_tag = ANY(:tags)
            GROUP BY b.beer_id
            HAVING COUNT(DISTINCT ft.flavor_tag) = :tagCount
        ) matched
        """,
        nativeQuery = true
    )
    Page<BeerCsv> findByAllTagsPageable(
        @Param("tags") String[] tags,
        @Param("tagCount") long tagCount,
        Pageable pageable);
    
}
