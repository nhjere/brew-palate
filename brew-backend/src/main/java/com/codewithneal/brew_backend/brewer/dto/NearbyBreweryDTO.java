package com.codewithneal.brew_backend.brewer.dto;

import java.util.UUID;

public class NearbyBreweryDTO {

    private UUID breweryId;
    private String breweryName;
    private String city;
    private String state;
    private double latitude;
    private double longitude;
    private double distance;

    public NearbyBreweryDTO(UUID breweryId, String breweryName, String city, String state, double latitude, double longitude, double distance) {
        this.breweryId = breweryId;
        this.breweryName = breweryName;
        this.city = city;
        this.state = state;
        this.latitude = latitude;
        this.longitude = longitude;
        this.distance = distance;
    }

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

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public double getDistance() {
        return distance;
    }

    public void setDistance(double distance) {
        this.distance = distance;
    }
}
