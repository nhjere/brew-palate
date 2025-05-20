package com.codewithneal.brew_backend.user.service;

import java.util.ArrayList;
import java.util.List;

import com.codewithneal.brew_backend.user.model.UserReview;
import org.springframework.stereotype.Service;

@Service
public class UserReviewService {
        private final List<UserReview> reviews = new ArrayList<>();

    public UserReview submitReview(UserReview review) {
        reviews.add(review);
        return review;
    }

    public List<UserReview> getAllReviews() {
        return reviews;
    }

    
}
