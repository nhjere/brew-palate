package com.codewithneal.brew_backend.brewer.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.codewithneal.brew_backend.brewer.model.Brewery;
import java.util.List;
import java.util.UUID;

public interface BreweryRepository extends JpaRepository<Brewery, UUID> {

    // runs a raw SQL query to calculate distance between brewery and user and return sorted results
    @Query(value = """
    SELECT * FROM (
        SELECT *, 
               (6371 * acos(
                   cos(radians(:latitude)) * cos(radians(latitude)) *
                   cos(radians(longitude) - radians(:longitude)) +
                   sin(radians(:latitude)) * sin(radians(latitude))
               )) AS distance
        FROM brewery_profiles
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    ) AS calculated
    WHERE distance < :radius
    ORDER BY distance ASC
    """, nativeQuery = true)
    List<Brewery> findByDistance(@Param("latitude") double latitude, @Param("longitude") double longitude, @Param("radius") double radius);    
}
