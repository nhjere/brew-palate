package com.codewithneal.brew_backend.brewer.CsvReader.breweries;

import jakarta.persistence.*;
import java.util.UUID;

import com.opencsv.bean.CsvBindByName;

@Entity
@Table(name = "imported_breweries")
public class BreweryCsv {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "brewery_id")
    private UUID breweryId;

    @CsvBindByName(column = "external_brewery_id")
    @Column(name = "external_brewery_id")
    private String externalBreweryId;

    @CsvBindByName(column = "name")
    private String name;

    @CsvBindByName(column = "city")
    private String city;

    @CsvBindByName(column = "state")
    private String state;

    public BreweryCsv() {}

    public BreweryCsv(String externalBreweryId, String name, String city, String state) {
        this.externalBreweryId = externalBreweryId;
        this.name = name;
        this.city = city;
        this.state = state;
    }

    public UUID getBreweryId() {
        return breweryId;
    }

    public void setBreweryId(UUID breweryId) {
        this.breweryId = breweryId;
    }

    public String getExternalBreweryId() {
        return externalBreweryId;
    }

    public void setExternalBreweryId(String externalBreweryId) {
        this.externalBreweryId = externalBreweryId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }
}
