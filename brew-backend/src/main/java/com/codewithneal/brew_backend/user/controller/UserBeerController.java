package com.codewithneal.brew_backend.user.controller;

import com.codewithneal.brew_backend.user.model.UserBeer;
import com.codewithneal.brew_backend.user.service.UserBeerService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/beers")
public class UserBeerController {

    private final UserBeerService beerService;

    public UserBeerController(UserBeerService beerService) {
        this.beerService = beerService;
    }

    @GetMapping
    public List<UserBeer> getAllBeers() {
        return beerService.getAllBeers();
    }
}
