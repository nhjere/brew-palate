package com.codewithneal.brew_backend.user.dto;

import java.util.UUID;

public class FriendSuggestionDto {
    private UUID id;
    private String displayName;
    private String city;


    public FriendSuggestionDto(UUID id, String displayName, String city) {
        this.id = id;
        this.displayName = displayName;
        this.city = city;
    }

    public UUID getId() { return id; }
    public String getDisplayName() { return displayName; }
    public String getCity() { return city; }

}
