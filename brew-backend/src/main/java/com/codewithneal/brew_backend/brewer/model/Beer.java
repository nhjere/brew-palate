package com.codewithneal.brew_backend.brewer.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

@Entity
@Table(name = "beers")
public class Beer {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID beer_id;

    @NotBlank(message = "Beer name is required")
    @Size(max = 100, message = "Name must be under 100 characters")
    private String name;

    @NotBlank(message = "Beer style is required")
    @Size(max = 50, message = "Style must be under 50 characters")
    private String style;

    @NotBlank(message = "Brewery ID is required")
    @Column(name = "brewery_id")
    private String breweryId;

    @NotBlank(message = "Brewery name is required")
    @Size(max = 100, message = "Brewery name must be under 100 characters")
    @Column(name = "brewery_name")
    private String breweryName;

    // Constructors
    public Beer() {}

    public Beer(UUID beer_id, String name, String style, String breweryId, String breweryName) {
        this.beer_id = beer_id;
        this.name = name;
        this.style = style;
        this.breweryId = breweryId;
        this.breweryName = breweryName;
    }

    // Getters and setters
    public UUID getId() {
        return beer_id;
    }

    public void setId(UUID beer_id) {
        this.beer_id = beer_id;
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

    public String getBreweryId() {
        return breweryId;
    }

    public void setBreweryId(String breweryId) {
        this.breweryId = breweryId;
    }

    public String getBreweryName() {
        return breweryName;
    }

    public void setBreweryName(String breweryName) {
        this.breweryName = breweryName;
    }
}
