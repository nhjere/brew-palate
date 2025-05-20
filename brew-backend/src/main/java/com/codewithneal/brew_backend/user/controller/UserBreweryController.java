package com.codewithneal.brew_backend.user.controller;

import com.codewithneal.brew_backend.user.model.Brewery;
import com.codewithneal.brew_backend.user.service.BreweryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/breweries")
public class UserBreweryController {

    private final BreweryService breweryService;

    public UserBreweryController(BreweryService breweryService) {
        this.breweryService = breweryService;
    }

    @GetMapping
    public List<Brewery> getAllBreweries() {
        return breweryService.getAllBreweries();
    }
}
