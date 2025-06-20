package com.codewithneal.brew_backend.user.dto;

import java.util.UUID;

public class UserRegistrationDTO {
    // includes only user registration data (no reviews or following)
    private UUID userId;
    private String username;
    private String role;
    private String address;

    public UserRegistrationDTO(UUID userId, String username, String role, String address) {
        this.userId = userId;
        this.username = username;
        this.role = "user";
        this.address = address;
    }

    // Getters
    public UUID getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getRole() { return role; }
    public String getAddress() { return address; }
}
