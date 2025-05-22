package com.codewithneal.brew_backend.user.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// defines a brewery profile with id (matched from beers list), name, location

@Entity
@Table(name = "brewery_profiles")
public class Brewery {

    @Id
    private String id;  // matches the breweryId from beers

    private String name;
    private String location;

    public Brewery() {}

    public Brewery(String id, String name, String location) {
        this.id = id;
        this.name = name;
        this.location = location;
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

    public String getLocation() { 
        return location; 
    }

    public void setLocation(String location) { 
        this.location = location; 
    }
}
