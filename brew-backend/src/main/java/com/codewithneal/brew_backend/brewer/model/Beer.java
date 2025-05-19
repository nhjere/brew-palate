package com.codewithneal.brew_backend.brewer.model;

public class Beer {
    private String id;
    private String name;
    private String style;
    private String breweryId;

    // Constructors
    public Beer() {}
    public Beer(String id, String name, String style, String breweryId) {
        this.id = id;
        this.name = name;
        this.style = style;
        this.breweryId = breweryId;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }

    public String getBreweryId() { return breweryId; }
    public void setBreweryId(String breweryId) { this.breweryId = breweryId; }
}
