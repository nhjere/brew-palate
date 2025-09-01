package com.codewithneal.brew_backend.brewer.dto;

import java.util.List;

public record BeerUpdateRequest(
    String name,
    String style,
    Double abv,
    Integer ibu,
    Double ounces,
    Double price,
    List<String> flavorTags
) {}