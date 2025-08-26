package com.codewithneal.brew_backend.brewer.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;


public record BeerCreateRequest(
        @NotBlank @Size(max = 64) String name,
        @NotBlank @Size(max = 64) String style,
        @NotNull @DecimalMin("0.0") @DecimalMax("1.0") Double abv,  // fraction 0–1
        @DecimalMin("0.0") @DecimalMax("120.0") Double ibu,
        @DecimalMin("0.0") Double ounces,
        @DecimalMin("0.0") Double price,
        @NotNull UUID breweryUuid,
        List<String> flavorTags
) {}
