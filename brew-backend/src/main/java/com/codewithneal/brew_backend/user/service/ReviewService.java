package com.codewithneal.brew_backend.user.service;

import com.codewithneal.brew_backend.user.dto.ReviewDTO;
import com.codewithneal.brew_backend.user.dto.ReviewMinimalDTO;
import com.codewithneal.brew_backend.user.model.Review;
import com.codewithneal.brew_backend.user.repository.ReviewRepository;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepo;

    public ReviewService(ReviewRepository reviewRepo) {
        this.reviewRepo = reviewRepo;
    }

    public Review saveReview(ReviewDTO dto) {
        Review review = new Review(
            dto.getUserId(),
            dto.getBeerId(),
            dto.getFlavorBalance(),
            dto.getMouthfeelQuality(),
            dto.getAromaIntensity(),
            dto.getFinishQuality(),
            dto.getOverallEnjoyment(),
            dto.getComment(),
            dto.getFlavorTags()
        );

        return reviewRepo.save(review);

    }

    // get reviews by user_id
    public List<Review> getReviewsByUser(UUID userId) {
        return reviewRepo.findByUserId(userId);
    }

    // get reviews by beer_id
    public List<Review> getReviewsByBeer(UUID beerId) {
        return reviewRepo.findByBeerId(beerId);
    }

    public List<Review> getAllReviews() {
        return reviewRepo.findAll();
    }

    // get all (minimal) review dtos posted by a specific user for recommender
    public List<ReviewMinimalDTO> getMinimalReviewsByUserId(UUID userId) {
    List<Review> reviews = reviewRepo.findByUserId(userId);
    return reviews.stream()
        .map(review -> new ReviewMinimalDTO(
            review.getUserId(),
            review.getBeerId(),
            review.getOverallEnjoyment(),
            review.getFlavorTags()
        ))
        .toList();
    }
}
