package com.codewithneal.brew_backend.brewer.CSVreader;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "imported_beers")
public class BeerCsv {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long internalId;

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



    public Long getInternalId() {
        return internalId;
    }

    public void setInternalId(Long internalId) {
        this.internalId = internalId;
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

}