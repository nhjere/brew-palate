package com.codewithneal.brew_backend.CsvReader.beers;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "bootstrapped_beers")
public class BeerCsv {

    @Id
    @UuidGenerator
    @Column(name = "beer_id", columnDefinition = "uuid")
    private UUID beerId;

    private Double abv;
    private Double ibu;
    private String name;
    private String style;
    private Double ounces;

    @Column(name = "brewery_uuid", columnDefinition = "uuid")
    private UUID breweryUuid;

    @Column(name = "price")
    private Double price;

    @ElementCollection
    @CollectionTable(name = "bootstrapped_beer_flavor_tags",
                     joinColumns = @JoinColumn(name = "beer_id"))
    @Column(name = "flavor_tag")
    private List<String> flavorTags;

    public BeerCsv() {}

    public BeerCsv(Double abv, Double ibu, String name, String style, Double ounces, UUID breweryUuid) {
        this.abv = abv;
        this.ibu = ibu;
        this.name = name;
        this.style = style;
        this.ounces = ounces;
        this.breweryUuid = breweryUuid;
    }

    public UUID getBeerId() { return beerId; }
    public void setBeerId(UUID beerId) { this.beerId = beerId; }

    public Double getAbv() { return abv; }
    public void setAbv(Double abv) { this.abv = abv; }

    public Double getIbu() { return ibu; }
    public void setIbu(Double ibu) { this.ibu = ibu; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }

    public Double getOunces() { return ounces; }
    public void setOunces(Double ounces) { this.ounces = ounces; }

    public UUID getBreweryUuid() { return breweryUuid; }
    public void setBreweryUuid(UUID breweryUuid) { this.breweryUuid = breweryUuid; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public List<String> getFlavorTags() { return flavorTags; }
    public void setFlavorTags(List<String> flavorTags) { this.flavorTags = flavorTags; }
}
