package com.codewithneal.brew_backend.user.model;

public class UserBeer {
    private String id;
    private String name;
    private String style;
    private String breweryName;
    private String breweryId;

    public UserBeer() {}

    public UserBeer(String id, String name, String style, String breweryName, String breweryIc) {
        this.id = id;
        this.name = name;
        this.style = style;
        this.breweryName = breweryName;
        this.breweryId = breweryIc;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
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

    public String getBreweryName() {
        return breweryName;
    }

    public void setBreweryName(String breweryName) {
        this.breweryName = breweryName;
    }

    public String getBreweryId() {
        return breweryId;
    }

    public void setBreweryId(String breweryId) {
        this.breweryId = breweryId;
    }
}
