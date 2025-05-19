package com.codewithneal.brew_backend.user.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

import com.codewithneal.brew_backend.user.model.Brewery;
import com.codewithneal.brew_backend.user.service.BreweryService;

@RestController
@RequestMapping("/api/breweries")
public class BreweryController {
    private final BreweryService breweryService;

    public BreweryController(BreweryService breweryService) {
        this.breweryService = breweryService;
    }

    @GetMapping
    public List<Brewery> getAllBreweries() {
        return breweryService.getBreweries();
    }
}
