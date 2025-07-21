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
}