package com.codewithneal.brew_backend.user.model;
import jakarta.persistence.*;
// import jakarta.validation.constraints.Max;
// import jakarta.validation.constraints.Min;
// import jakarta.validation.constraints.NotNull;
// import jakarta.validation.constraints.Size;

import java.util.UUID;

@Entity
@Table(name = "user_profiles")
public class User {

    public User() {
        // JPA requires a no-arg constructor
    }

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "username")
    private String username;
    
    @Column(name = "role")
    private String role;

    @Column(name = "address")
    private String address;

    // holds all user meta data created upon registration
    public User(UUID userId, String username, String role, String address) {
        this.userId = userId;
        this.username = username;
        this.role = role;
        this.address = address;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
    

}
