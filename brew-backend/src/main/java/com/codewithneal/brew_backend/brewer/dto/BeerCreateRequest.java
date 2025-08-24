package com.codewithneal.brew_backend.brewer.dto;

import java.util.List;
import java.util.UUID;

public class BeerCreateRequest {
    public String name;
    public String style;
    public Double abv;
    public Double ibu;
    public Double ounces;          // optional
    public Double price;
    public UUID breweryUuid;
    public List<String> flavorTags;
}
