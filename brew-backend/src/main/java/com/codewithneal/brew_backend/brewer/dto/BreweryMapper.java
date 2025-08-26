package com.codewithneal.brew_backend.brewer.dto;


import java.util.UUID;

import com.codewithneal.brew_backend.brewer.model.Brewery;

public class BreweryMapper {
    public static Brewery toEntity(BreweryDTO dto) {
        Brewery brewery = new Brewery();

        brewery.setBreweryId(UUID.fromString(dto.getIdString()));
        brewery.setBreweryName(dto.getBreweryName());
        brewery.setBreweryType(dto.getBreweryType());
        brewery.setStreet(dto.getStreet());
        brewery.setCity(dto.getCity());
        brewery.setState(dto.getState());
        brewery.setPostalCode(dto.getPostalCode());
        brewery.setCountry(dto.getCountry());
        brewery.setPhone(dto.getPhone());
        brewery.setWebsiteUrl(dto.getWebsiteUrl());
        brewery.setLatitude(dto.getLatitude());
        brewery.setLongitude(dto.getLongitude());

        return brewery;
    }

    public static BreweryDTO toDTO(Brewery brewery) {
        BreweryDTO dto = new BreweryDTO();

        dto.setBreweryId(brewery.getBreweryId().toString());
        dto.setBreweryName(brewery.getBreweryName());
        dto.setBreweryType(brewery.getBreweryType());
        dto.setStreet(brewery.getStreet());
        dto.setCity(brewery.getCity());
        dto.setState(brewery.getState());
        dto.setPostalCode(brewery.getPostalCode());
        dto.setCountry(brewery.getCountry());
        dto.setPhone(brewery.getPhone());
        dto.setWebsiteUrl(brewery.getWebsiteUrl());
        dto.setLatitude(brewery.getLatitude());
        dto.setLongitude(brewery.getLongitude());

        return dto;
    }

    // CREATE DTO maps a user created brewery to a real brewery object

    public static Brewery fromCreateDTO(BreweryDTO dto) {
        Brewery b = new Brewery();
        b.setBreweryName(dto.getBreweryName());
        b.setBreweryType(dto.getBreweryType());
        b.setStreet(dto.getStreet());
        b.setCity(dto.getCity());
        b.setState(dto.getState());
        b.setPostalCode(dto.getPostalCode());
        b.setCountry(dto.getCountry());
        b.setPhone(dto.getPhone());
        b.setWebsiteUrl(dto.getWebsiteUrl());
        b.setLatitude(null);
        b.setLongitude(null);
        return b;
    }

    // Patch only non-null fields when from DTO when User updates brewery fields
    public static void applyPatch(Brewery target, BreweryDTO dto) {
        if (dto.getBreweryName() != null)  target.setBreweryName(dto.getBreweryName());
        if (dto.getBreweryType() != null)  target.setBreweryType(dto.getBreweryType());
        if (dto.getStreet() != null)       target.setStreet(dto.getStreet());
        if (dto.getCity() != null)         target.setCity(dto.getCity());
        if (dto.getState() != null)        target.setState(dto.getState());
        if (dto.getPostalCode() != null)   target.setPostalCode(dto.getPostalCode());
        if (dto.getCountry() != null)      target.setCountry(dto.getCountry());
        if (dto.getPhone() != null)        target.setPhone(dto.getPhone());
        if (dto.getWebsiteUrl() != null)   target.setWebsiteUrl(dto.getWebsiteUrl());
        if (dto.getLatitude() != null)     target.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null)    target.setLongitude(dto.getLongitude());
    }
    



}