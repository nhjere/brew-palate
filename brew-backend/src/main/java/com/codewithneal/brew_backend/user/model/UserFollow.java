package com.codewithneal.brew_backend.user.model;

public class UserFollow {
    private String userId;
    private String breweryId;

    public UserFollow() {}

    public UserFollow(String userId, String breweryId) {
        this.userId = userId;
        this.breweryId = breweryId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getBreweryId() {
        return breweryId;
    }

    public void setBreweryId(String breweryId) {
        this.breweryId = breweryId;
    }
}
