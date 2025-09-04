package com.codewithneal.brew_backend.user.repository;

import com.codewithneal.brew_backend.user.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByUserId(UUID userId);
    List<Review> findByBeerId(UUID beerId);
    // used by analytics controller
    List<Review> findByBeerIdIn(List<UUID> beerIds);
}
