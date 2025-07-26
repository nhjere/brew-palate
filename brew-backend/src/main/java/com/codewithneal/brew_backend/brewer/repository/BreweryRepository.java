package com.codewithneal.brew_backend.brewer.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.codewithneal.brew_backend.brewer.dto.NearbyBreweryDTO;
import com.codewithneal.brew_backend.brewer.model.Brewery;
import java.util.List;
import java.util.UUID;

public interface BreweryRepository extends JpaRepository<Brewery, UUID> {

    // runs a raw SQL query to calculate distance between brewery and user and return sorted results
    @Query(value = """
    SELECT * FROM (
        SELECT 
            b.brewery_id AS breweryId,
            b.brewery_name AS breweryName,
            b.city AS city,
            b.state AS state,
            b.latitude AS latitude,
            b.longitude AS longitude,
            (6371 * acos(
                cos(radians(:latitude)) * cos(radians(b.latitude)) *
                cos(radians(b.longitude) - radians(:longitude)) +
                sin(radians(:latitude)) * sin(radians(b.latitude))
            )) AS distance
        FROM brewery_profiles b
        WHERE b.latitude IS NOT NULL AND b.longitude IS NOT NULL
    ) AS calculated
    WHERE distance < :radius
    ORDER BY distance ASC
    """, nativeQuery = true)
    List<NearbyBreweryDTO> findNearbyWithDistance(
        @Param("latitude") double latitude,
        @Param("longitude") double longitude,
        @Param("radius") double radius
    );
}
