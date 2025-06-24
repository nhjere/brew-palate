package com.codewithneal.brew_backend.user.dto;

import java.util.List;
import java.util.UUID;

public class ReviewDTO {

    private UUID userId;
    private UUID beerId;
    private int flavorBalance;
    private int mouthfeelQuality;
    private int aromaIntensity;
    private int finishQuality;
    private int overallEnjoyment;
    private List<String> flavorTags;
    private String comment;

    public ReviewDTO() {}

    public ReviewDTO(UUID userId, UUID beerId, int flavorBalance, int mouthfeelQuality, int aromaIntensity,
                         int finishQuality, int overallEnjoyment, List<String> flavorTags, String comment) {
        this.userId = userId;
        this.beerId = beerId;
        this.flavorBalance = flavorBalance;
        this.mouthfeelQuality = mouthfeelQuality;
        this.aromaIntensity = aromaIntensity;
        this.finishQuality = finishQuality;
        this.overallEnjoyment = overallEnjoyment;
        this.flavorTags = flavorTags;
        this.comment = comment;
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
