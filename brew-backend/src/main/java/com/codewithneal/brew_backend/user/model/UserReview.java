package com.codewithneal.brew_backend.user.model;

import java.util.List;

public class UserReview {
    private String userId;
    private String beerId;

    private int flavorBalance;       // 1–5 (5 = ideal balance)
    private int mouthfeelQuality;    // 1–5 (5 = ideal texture/body)
    private int aromaIntensity;      // 1–5 (5 = ideal strength/pleasantness)
    private int finishQuality;       // 1–5 (5 = ideal aftertaste)
    private int overallEnjoyment;    // 1–5 (5 = loved it)
    private List<String> flavorTags;
    private String comment;

    public UserReview() {}

    public UserReview(String userId, String beerId, int flavorBalance, int mouthfeelQuality, int aromaIntensity, int finishQuality, int overallEnjoyment, String comment, List<String> flavorTags) {
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

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getBeerId() {
        return beerId;
    }

    public void setBeerId(String beerId) {
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

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public List<String> getFlavorTags() {
        return flavorTags;
    }
    public void setFlavorTags(List<String> flavorTags) {
        this.flavorTags = flavorTags;
    }
}
