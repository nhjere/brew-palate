package com.codewithneal.brew_backend.brewer.CsvReader.beers;

import jakarta.persistence.*;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "imported_beers")
public class BeerCsv {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "beer_id")
    private UUID beerId;

    private Double abv;
    private Double ibu;

    @Column(name = "external_beer_id")
    private String id;

    private String name;
    private String style;

    @Column(name = "external_brewery_id")
    private String breweryId;

    private Double ounces;

    @ElementCollection
    @CollectionTable(name = "imported_beer_flavor_tags", joinColumns = @JoinColumn(name = "beer_id"))
    @Column(name = "flavor_tag")
    private List<String> flavorTags;

    public BeerCsv() {}

    public BeerCsv(Double abv, Double ibu, String id, String name, String style, String breweryId, Double ounces) {
        this.abv = abv;
        this.ibu = ibu;
        this.id = id;
        this.name = name;
        this.style = style;
        this.breweryId = breweryId;
        this.ounces = ounces;
    }

    // Getters and setters

    public void setFlavorTags(List<String> flavorTags) {
        this.flavorTags = flavorTags;
    }

    public List<String> getFlavorTags() {
        return flavorTags;
    }

    public UUID getBeerId() {
        return beerId;
    }

    public void setInternalId(UUID beerId) {
        this.beerId = beerId;
    }

    public Double getAbv() {
        return abv;
    }

    public void setAbv(Double abv) {
        this.abv = abv;
    }

    public Double getIbu() {
        return ibu;
    }

    public void setIbu(Double ibu) {
        this.ibu = ibu;
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

    public String getBreweryId() {
        return breweryId;
    }

    public void setBreweryId(String breweryId) {
        this.breweryId = breweryId;
    }

    public Double getOunces() {
        return ounces;
    }

    public void setOunces(Double ounces) {
        this.ounces = ounces;
    }

}