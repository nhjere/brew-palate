package com.codewithneal.brew_backend.user.controller;

import com.codewithneal.brew_backend.user.model.UserReview;
import com.codewithneal.brew_backend.user.service.UserReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/reviews")
public class UserReviewController {

    private final UserReviewService reviewService;

    public UserReviewController(UserReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<UserReview> submitReview(@RequestBody UserReview review) {
        return ResponseEntity.ok(reviewService.submitReview(review));
    }

    @GetMapping
    public List<UserReview> getAllReviews() {
        return reviewService.getAllReviews();
    }
}