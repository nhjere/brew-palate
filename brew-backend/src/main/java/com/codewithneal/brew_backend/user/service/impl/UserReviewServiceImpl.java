package com.codewithneal.brew_backend.user.service.impl;

import com.codewithneal.brew_backend.user.model.UserReview;
import com.codewithneal.brew_backend.user.repository.UserReviewRepository;
import com.codewithneal.brew_backend.user.service.UserReviewService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserReviewServiceImpl implements UserReviewService {

    private final UserReviewRepository userReviewRepository;

    public UserReviewServiceImpl(UserReviewRepository userReviewRepository) {
        this.userReviewRepository = userReviewRepository;
    }

    @Override
    public UserReview submitReview(UserReview review) {
        return userReviewRepository.save(review);
    }

    @Override
    public List<UserReview> getAllReviews() {
        return userReviewRepository.findAll();
    }
}
