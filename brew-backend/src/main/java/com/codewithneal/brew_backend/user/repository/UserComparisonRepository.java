package com.codewithneal.brew_backend.user.repository;

import com.codewithneal.brew_backend.user.model.UserComparison;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserComparisonRepository extends JpaRepository<UserComparison, UUID> {
    List<UserComparison> findByUserId(UUID userId);
    List<UserComparison> findByUserIdAndContext(UUID userId, String context);
}
