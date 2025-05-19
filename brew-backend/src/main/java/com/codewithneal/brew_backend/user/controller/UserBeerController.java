package com.codewithneal.brew_backend.user.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.codewithneal.brew_backend.user.model.UserBeer;
import com.codewithneal.brew_backend.user.service.UserBeerService;

import java.util.List;

@RestController
@RequestMapping("/api/beers")
public class UserBeerController {
    private final UserBeerService beerService;

    public UserBeerController(UserBeerService beerService) {
        this.beerService = beerService;
    }

    @GetMapping
    public List<UserBeer> getAllBeers() {
        return beerService.getBeers();
    }
}