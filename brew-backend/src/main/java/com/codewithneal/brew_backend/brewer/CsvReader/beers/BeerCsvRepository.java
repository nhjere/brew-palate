package com.codewithneal.brew_backend.brewer.CsvReader.beers;

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

}
