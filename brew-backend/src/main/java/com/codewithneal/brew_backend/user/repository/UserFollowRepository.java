package com.codewithneal.brew_backend.user.repository;

import com.codewithneal.brew_backend.user.model.UserFollow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserFollowRepository extends JpaRepository<UserFollow, UUID> {

    List<UserFollow> findByUserId(UUID userId);

    boolean existsByUserIdAndBrewery_BreweryId(UUID userId, UUID breweryId);

    void deleteByUserIdAndBrewery_BreweryId(UUID userId, UUID breweryId);
}