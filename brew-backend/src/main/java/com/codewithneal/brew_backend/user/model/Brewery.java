package com.codewithneal.brew_backend.user.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

@Entity
@Table(name = "brewery_profiles")
public class Brewery {

    @Id
    @Column(name = "brewery_id")
    private UUID breweryId;

    @NotBlank(message = "Brewery name is required")
    @Size(max = 100, message = "Brewery name must be under 100 characters")
    @Column(name = "brewery_name")
    private String breweryName;

    @NotBlank(message = "Location is required")
    @Size(max = 100, message = "Location must be under 100 characters")
    private String location;

    // Getters and Setters
    public UUID getBreweryId() {
        return breweryId;
    }

    public void setBreweryId(UUID breweryId) {
        this.breweryId = breweryId;
    }

    public String getBreweryName() {
        return breweryName;
    }

    public void setBreweryName(String breweryName) {
        this.breweryName = breweryName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
