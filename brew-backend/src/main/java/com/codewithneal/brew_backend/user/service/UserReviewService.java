package com.codewithneal.brew_backend.user.service;

import com.codewithneal.brew_backend.user.model.UserReview;
import java.util.List;

public interface UserReviewService {
    UserReview submitReview(UserReview review);
    List<UserReview> getAllReviews();
}
