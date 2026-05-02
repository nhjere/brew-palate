package com.codewithneal.brew_backend.user.dto;

import java.util.UUID;

public class UserEloScoreDTO {

    private UUID userId;
    private UUID beerId;
    private double score;
    private int comparisonCount;

    public UserEloScoreDTO() {}

    public UserEloScoreDTO(UUID userId, UUID beerId, double score, int comparisonCount) {
        this.userId = userId;
        this.beerId = beerId;
        this.score = score;
        this.comparisonCount = comparisonCount;
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

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public int getComparisonCount() {
        return comparisonCount;
    }

    public void setComparisonCount(int comparisonCount) {
        this.comparisonCount = comparisonCount;
    }
}
