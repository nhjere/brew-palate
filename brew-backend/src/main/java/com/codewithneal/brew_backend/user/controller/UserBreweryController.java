package com.codewithneal.brew_backend.user.controller;

import com.codewithneal.brew_backend.user.model.Brewery;
import com.codewithneal.brew_backend.user.service.UserBreweryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/breweries")
public class UserBreweryController {

    private final UserBreweryService breweryService;

    public UserBreweryController(UserBreweryService breweryService) {
        this.breweryService = breweryService;
    }

    @GetMapping
    public List<Brewery> getAllBreweries() {
        return breweryService.getAllBreweries();
    }
}
