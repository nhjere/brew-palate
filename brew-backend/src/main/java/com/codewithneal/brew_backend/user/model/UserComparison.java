package com.codewithneal.brew_backend.user.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_comparisons")
public class UserComparison {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "comparison_id")
    private UUID comparisonId;

    @NotNull(message = "User ID is required")
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @NotNull(message = "Beer A ID is required")
    @Column(name = "beer_a_id", nullable = false)
    private UUID beerAId;

    @NotNull(message = "Beer B ID is required")
    @Column(name = "beer_b_id", nullable = false)
    private UUID beerBId;

    @NotNull(message = "Winner ID is required")
    @Column(name = "winner_id", nullable = false)
    private UUID winnerId;

    @Size(max = 50)
    @Column(name = "context")
    private String context;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public UserComparison() {}

    public UserComparison(UUID userId, UUID beerAId, UUID beerBId, UUID winnerId, String context) {
        this.userId = userId;
        this.beerAId = beerAId;
        this.beerBId = beerBId;
        this.winnerId = winnerId;
        this.context = context;
    }

    public UUID getComparisonId() {
        return comparisonId;
    }

    public void setComparisonId(UUID comparisonId) {
        this.comparisonId = comparisonId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getBeerAId() {
        return beerAId;
    }

    public void setBeerAId(UUID beerAId) {
        this.beerAId = beerAId;
    }

    public UUID getBeerBId() {
        return beerBId;
    }

    public void setBeerBId(UUID beerBId) {
        this.beerBId = beerBId;
    }

    public UUID getWinnerId() {
        return winnerId;
    }

    public void setWinnerId(UUID winnerId) {
        this.winnerId = winnerId;
    }

    public String getContext() {
        return context;
    }

    public void setContext(String context) {
        this.context = context;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
