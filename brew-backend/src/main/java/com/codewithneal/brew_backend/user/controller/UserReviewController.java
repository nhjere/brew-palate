package com.codewithneal.brew_backend.user.controller;

import com.codewithneal.brew_backend.user.model.Review;
import com.codewithneal.brew_backend.user.service.ReviewService;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;

import com.codewithneal.brew_backend.user.dto.ReviewDTO;
import com.codewithneal.brew_backend.user.dto.ReviewMinimalDTO;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/reviews")
public class UserReviewController {

    private final ReviewService reviewService;

    public UserReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }
    
    // saves a rating by calling review service
    @PostMapping()
    public ResponseEntity<?> postReview(@RequestBody ReviewDTO dto) {
        Review saved = reviewService.saveReview(dto);
        return ResponseEntity.status(201).body(saved);
    }

    // get all reviews
    @GetMapping()
    public ResponseEntity<List<Review>> getAllReviews() {
        List<Review> reviews = reviewService.getAllReviews();
        return ResponseEntity.ok(reviews);
    }

    /*  RECOMMENDER SERVICE API */

    // get all reviews stored by a user for Fast API recommender
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewMinimalDTO>> getReviewsByUser(@PathVariable UUID userId) {
        List<ReviewMinimalDTO> reviewDTOs = reviewService.getMinimalReviewsByUserId(userId);
        return ResponseEntity.ok(reviewDTOs);
    }
}