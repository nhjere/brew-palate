package com.codewithneal.brew_backend.user.repository;

import com.codewithneal.brew_backend.user.model.UserReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserReviewRepository extends JpaRepository<UserReview, UUID> {
}
