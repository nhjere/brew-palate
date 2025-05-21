package com.codewithneal.brew_backend.user.model;

public class UserBrewery {
    private String id;
    private String name;
    private String location;

    public UserBrewery() {}

    public UserBrewery(String id, String name, String location) {
        this.id = id;
        this.name = name;
        this.location = location;
    }

    // Getters and setters
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

    public String getLocation() { 
        return location; 
    }

    public void setLocation(String location) { 
        this.location = location; 
    }
}
