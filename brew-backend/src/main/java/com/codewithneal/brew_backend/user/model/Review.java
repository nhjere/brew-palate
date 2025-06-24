package com.codewithneal.brew_backend.user.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "user_reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "review_id")
    private UUID reviewId;

    @NotNull(message = "User ID is required")
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @NotNull(message = "Beer ID is required")
    @Column(name = "beer_id", nullable = false)
    private UUID beerId;

    @Min(1) @Max(5)
    private int flavorBalance;

    @Min(1) @Max(5)
    private int mouthfeelQuality;

    @Min(1) @Max(5)
    private int aromaIntensity;

    @Min(1) @Max(5)
    private int finishQuality;

    @Min(1) @Max(5)
    private int overallEnjoyment;

    @ElementCollection
    private List<@Size(max = 30) String> flavorTags;

    @Size(max = 500, message = "Comment must be under 500 characters")
    private String comment;

    public Review() {}

    public Review(UUID userId, UUID beerId, int flavorBalance, int mouthfeelQuality, int aromaIntensity, int finishQuality, int overallEnjoyment, String comment, List<String> flavorTags) {
        this.userId = userId;
        this.beerId = beerId;
        this.flavorBalance = flavorBalance;
        this.mouthfeelQuality = mouthfeelQuality;
        this.aromaIntensity = aromaIntensity;
        this.finishQuality = finishQuality;
        this.overallEnjoyment = overallEnjoyment;
        this.comment = comment;
        this.flavorTags = flavorTags;
    }

    public UUID getReviewId() {
        return reviewId;
    }

    public void setReviewId(UUID reviewId) {
        this.reviewId = reviewId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getBeerId() {
        return beerId;
    }

    public void setBeerId(UUID beerId) {
        this.beerId = beerId;
    }

    public int getFlavorBalance() {
        return flavorBalance;
    }

    public void setFlavorBalance(int flavorBalance) {
        this.flavorBalance = flavorBalance;
    }

    public int getMouthfeelQuality() {
        return mouthfeelQuality;
    }

    public void setMouthfeelQuality(int mouthfeelQuality) {
        this.mouthfeelQuality = mouthfeelQuality;
    }

    public int getAromaIntensity() {
        return aromaIntensity;
    }

    public void setAromaIntensity(int aromaIntensity) {
        this.aromaIntensity = aromaIntensity;
    }

    public int getFinishQuality() {
        return finishQuality;
    }

    public void setFinishQuality(int finishQuality) {
        this.finishQuality = finishQuality;
    }

    public int getOverallEnjoyment() {
        return overallEnjoyment;
    }

    public void setOverallEnjoyment(int overallEnjoyment) {
        this.overallEnjoyment = overallEnjoyment;
    }

    public List<String> getFlavorTags() {
        return flavorTags;
    }

    public void setFlavorTags(List<String> flavorTags) {
        this.flavorTags = flavorTags;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
