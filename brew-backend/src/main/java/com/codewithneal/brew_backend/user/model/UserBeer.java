package com.codewithneal.brew_backend.user.model;

public class UserBeer {
    private Long id;
    private String name;
    private String style;
    private Long breweryId;

    // Constructor
    public UserBeer(Long id, String name, String style, Long breweryId) {
        this.id = id;
        this.name = name;
        this.style = style;
        this.breweryId = breweryId;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getStyle() {
        return style;
    }

    public Long getBreweryId() {
        return breweryId;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }
}
