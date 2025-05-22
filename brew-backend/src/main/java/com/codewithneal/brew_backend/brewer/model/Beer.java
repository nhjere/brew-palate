package com.codewithneal.brew_backend.brewer.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "brewer_beers")
public class Beer {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String name;
    private String style;

    @Column(name = "brewery_id")
    private String breweryId;

    @Column(name = "brewery_name")
    private String breweryName;

    // Constructors
    public Beer() {}

    public Beer(UUID id, String name, String style, String breweryId, String breweryName) {
        this.id = id;
        this.name = name;
        this.style = style;
        this.breweryId = breweryId;
        this.breweryName = breweryName;
    }

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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
