package com.codewithneal.brew_backend.user.controller;

import com.codewithneal.brew_backend.user.model.UserBeer;
import com.codewithneal.brew_backend.user.service.UserBeerService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/beers")
public class UserBeerController {

    private final UserBeerService beerService;

    public UserBeerController(UserBeerService beerService) {
        this.beerService = beerService;
    }

    // list all beers
    @GetMapping
    public List<UserBeer> getAllBeers() {
        return beerService.getAllBeers();
    }

    // add a beer
    @PostMapping
    public ResponseEntity<UserBeer> addBeer(@RequestBody UserBeer beer) {
        return ResponseEntity.ok(beerService.addBeer(beer));
    }
}
