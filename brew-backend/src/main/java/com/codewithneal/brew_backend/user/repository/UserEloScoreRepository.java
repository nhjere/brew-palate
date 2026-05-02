package com.codewithneal.brew_backend.user.repository;

import com.codewithneal.brew_backend.user.model.UserEloScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserEloScoreRepository extends JpaRepository<UserEloScore, UUID> {
    List<UserEloScore> findByUserId(UUID userId);
    Optional<UserEloScore> findByUserIdAndBeerId(UUID userId, UUID beerId);
}
