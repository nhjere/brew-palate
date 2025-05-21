package com.codewithneal.brew_backend.user.service.impl;

import com.codewithneal.brew_backend.user.model.UserReview;
import com.codewithneal.brew_backend.user.service.UserReviewService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class UserReviewServiceImpl implements UserReviewService {

    private final List<UserReview> reviews = new ArrayList<>();

    @Override
    public UserReview submitReview(UserReview review) {
        review.setUserId(UUID.randomUUID().toString());
        reviews.add(review);
        return review;
    }

    @Override
    public List<UserReview> getAllReviews() {
        return reviews;
    }
}
