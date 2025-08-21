package com.codewithneal.brew_backend.user.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
public class User {

    public User() {}

    @Id
    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(name = "username")
    private String username;

    @Column(name = "role")
    private String role;

    @Column(name = "address")
    private String address;

    // NEW fields to “remember” the brewery
    @Column(name = "has_brewery", nullable = false)
    private boolean hasBrewery = false;

    @Column(name = "brewery_id")
    private UUID breweryId; // nullable

    // getters/setters
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public boolean isHasBrewery() { return hasBrewery; }
    public void setHasBrewery(boolean hasBrewery) { this.hasBrewery = hasBrewery; }

    public UUID getBreweryId() { return breweryId; }
    public void setBreweryId(UUID breweryId) { this.breweryId = breweryId; }
}
