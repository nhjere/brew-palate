package com.codewithneal.brew_backend.user.model;

import jakarta.persistence.*;

import java.util.UUID;

// adds mapping relationship between a unique user id and a unique brewery

@Entity
@Table(name = "user_follows")
public class UserFollow {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String userId;

    @ManyToOne
    @JoinColumn(name = "brewery_id")
    private Brewery brewery;

    public UserFollow() {}
    public UserFollow(String userId, Brewery brewery) {
        this.userId = userId;
        this.brewery = brewery;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Brewery getBrewery() {
        return brewery;
    }

    public void setBrewery(Brewery brewery) {
        this.brewery = brewery;
    }
}
