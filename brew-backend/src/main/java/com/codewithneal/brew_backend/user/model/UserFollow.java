package com.codewithneal.brew_backend.user.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

// adds mapping relationship between a unique user id and a unique brewery

@Entity
@Table(name = "user_follows")
public class UserFollow {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "follow_id")
    private UUID follow_id;

    @NotNull(message = "User ID is required")
    @Column(name = "user_id")
    private UUID userId;

    @NotNull(message = "Brewery reference is required")
    @ManyToOne
    @JoinColumn(name = "brewery_id")
    private Brewery brewery;

    public UserFollow() {}
    public UserFollow(UUID userId, Brewery brewery) {
        this.userId = userId;
        this.brewery = brewery;
    }

    public UUID getId() {
        return follow_id;
    }

    public void setId(UUID follow_id) {
        this.follow_id = follow_id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public Brewery getBrewery() {
        return brewery;
    }

    public void setBrewery(Brewery brewery) {
        this.brewery = brewery;
    }
}
