package com.codewithneal.brew_backend.user.dto;

import java.util.UUID;

public class BeerDTO {
    private UUID id;
    private String name;
    private String style;
    private String breweryId;
    private String breweryName;

    public BeerDTO(UUID id, String name, String style, String breweryId, String breweryName) {
        this.id = id;
        this.name = name;
        this.style = style;
        this.breweryId = breweryId;
        this.breweryName = breweryName;
    }

    // Getters
    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getStyle() { return style; }
    public String getBreweryId() { return breweryId; }
    public String getBreweryName() { return breweryName; }
}
