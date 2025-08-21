package com.codewithneal.brew_backend.brewer.model;

import java.util.UUID;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
// import java.util.UUID;

@Entity
@Table(name = "brewery_profiles")
public class Brewery {

    @Id
    @GeneratedValue
    @Column(name = "brewery_id", updatable = false, nullable = false)
    private UUID breweryId;

    @Column(name = "brewery_name", nullable = true)
    private String breweryName;

    @Column(name = "brewery_type")
    private String breweryType;

    @Column(name = "street")
    private String street;

    @Column(name = "city")
    private String city;

    @Size(max = 100)
    @Column(name = "state")
    private String state;

    @Size(max = 20)
    @Column(name = "postal_code")
    private String postalCode;

    @Size(max = 100)
    @Column(name = "country")
    private String country;

    @Size(max = 20)
    @Column(name = "phone")
    private String phone;

    @Size(max = 200)
    @Column(name = "website_url")
    private String websiteUrl;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    public UUID getBreweryId() {
        return breweryId;
    }

    public void setBreweryId(UUID breweryId) {
    this.breweryId = breweryId;
    }

    public String getBreweryName() {
        return breweryName;
    }

    public void setBreweryName(String breweryName) {
        this.breweryName = breweryName;
    }

    public String getBreweryType() {
        return breweryType;
    }

    public void setBreweryType(String breweryType) {
        this.breweryType = breweryType;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
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

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getWebsiteUrl() {
        return websiteUrl;
    }

    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}
