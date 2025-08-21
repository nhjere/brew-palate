package com.codewithneal.brew_backend.user.repository;

import com.codewithneal.brew_backend.user.model.User;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    boolean existsByUsername(String username);
    Optional<User> findByUsername(String username);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.hasBrewery = TRUE, u.breweryId = :breweryId WHERE u.userId = :userId")
    void setHasBreweryAndId(@Param("userId") UUID userId, @Param("breweryId") UUID breweryId);
}
