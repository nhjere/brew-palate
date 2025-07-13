package com.codewithneal.brew_backend.user.dto;

import java.util.List;
import java.util.UUID;

public class ReviewMinimalDTO {

    private UUID userId;
    private UUID beerId;
    private int overallEnjoyment;
    private List<String> flavorTags;

    public ReviewMinimalDTO() {}

    public ReviewMinimalDTO(UUID userId, UUID beerId, int overallEnjoyment, List<String> flavorTags) {
        this.userId = userId;
        this.beerId = beerId;
        this.overallEnjoyment = overallEnjoyment;
        this.flavorTags = flavorTags;
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
}
