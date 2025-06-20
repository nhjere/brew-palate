package com.codewithneal.brew_backend.brewer.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "beers")
public class Beer {

    @Id
    @Column(name = "beer_id")
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID beerId;

    @NotBlank(message = "Beer name is required")
    @Size(max = 100, message = "Name must be under 100 characters")
    @Column(name = "beer_name")
    private String name;

    @NotBlank(message = "Beer style is required")
    @Size(max = 50, message = "Style must be under 50 characters")
    @Column(name = "beer_style")
    private String style;

    @NotBlank(message = "Brewery ID is required")
    @Column(name = "brewery_id")
    private UUID breweryId;

    @NotBlank(message = "Brewery name is required")
    @Size(max = 100, message = "Brewery name must be under 100 characters")
    @Column(name = "brewery_name")
    private String breweryName;

    @ElementCollection
    private List<@Size(max = 30) String> flavorTags;

    // Constructors
    public Beer() {}

    public Beer(UUID beerId, String name, String style, UUID breweryId, String breweryName, List<String> flavorTags) {
        this.beerId = beerId;
        this.name = name;
        this.style = style;
        this.breweryId = breweryId;
        this.breweryName = breweryName;
        this.flavorTags = flavorTags;
    }

    // Getters and setters
    public UUID getId() {
        return beerId;
    }

    public void setId(UUID beerId) {
        this.beerId = beerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStyle() {
        return style;
    }

    public void setStyle(String style) {
        this.style = style;
    }

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

    public List<String> getFlavorTags() {
        return flavorTags;
    }

    public void setFlavorTags(List<String> flavorTags) {
        this.flavorTags = flavorTags;
    }

}
