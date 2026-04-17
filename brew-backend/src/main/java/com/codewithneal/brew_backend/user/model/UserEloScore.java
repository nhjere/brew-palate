package com.codewithneal.brew_backend.user.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_elo_scores", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "beer_id"})
})
public class UserEloScore {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "elo_score_id")
    private UUID eloScoreId;

    @NotNull(message = "User ID is required")
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @NotNull(message = "Beer ID is required")
    @Column(name = "beer_id", nullable = false)
    private UUID beerId;

    @Column(name = "score", nullable = false)
    private double score = 1500.0;

    @Column(name = "comparison_count", nullable = false)
    private int comparisonCount = 0;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UserEloScore() {}

    public UserEloScore(UUID userId, UUID beerId) {
        this.userId = userId;
        this.beerId = beerId;
        this.score = 1500.0;
        this.comparisonCount = 0;
    }

    public UUID getEloScoreId() {
        return eloScoreId;
    }

    public void setEloScoreId(UUID eloScoreId) {
        this.eloScoreId = eloScoreId;
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
