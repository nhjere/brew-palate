package com.codewithneal.brew_backend.user.dto;

import java.util.UUID;

public class UserComparisonDTO {

    private UUID userId;
    private UUID beerAId;
    private UUID beerBId;
    private UUID winnerId;
    private String context;

    public UserComparisonDTO() {}

    public UserComparisonDTO(UUID userId, UUID beerAId, UUID beerBId, UUID winnerId, String context) {
        this.userId = userId;
        this.beerAId = beerAId;
        this.beerBId = beerBId;
        this.winnerId = winnerId;
        this.context = context;
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
}
