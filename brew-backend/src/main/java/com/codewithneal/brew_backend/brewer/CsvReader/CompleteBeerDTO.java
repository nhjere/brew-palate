package com.codewithneal.brew_backend.brewer.CsvReader;

import java.util.UUID;
import java.util.List;

public class CompleteBeerDTO {
    private UUID beerId;
    private String name;
    private String style;
    private Double abv;
    private Double ibu;
    private List<String> flavorTags;
    private String externalBreweryId;
    private String breweryName;

    public CompleteBeerDTO() {
    }

    public CompleteBeerDTO(UUID beerId, String name, String style, Double abv, Double ibu, List<String> flavorTags, String externalBreweryId, String breweryName) {
        this.beerId = beerId;
        this.name = name;
        this.style = style;
        this.abv = abv;
        this.ibu = ibu;
        this.flavorTags = flavorTags;
        this.externalBreweryId = externalBreweryId;
        this.breweryName = breweryName;
    }

    public UUID getBeerId() {
        return beerId;
    }

    public void setBeerId(UUID beerId) {
        this.beerId = beerId;
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

    public List<String> getFlavorTags() {
        return flavorTags;
    }

    public void setFlavorTags(List<String> flavorTags) {
        this.flavorTags = flavorTags;
    }

    public String getExternalBreweryId() {
        return externalBreweryId;
    }

    public void setExternalBreweryId(String externalBreweryId) {
        this.externalBreweryId = externalBreweryId;
    }

    public String getBreweryName() {
        return breweryName;
    }

    public void setBreweryName(String breweryName) {
        this.breweryName = breweryName;
    }
}
