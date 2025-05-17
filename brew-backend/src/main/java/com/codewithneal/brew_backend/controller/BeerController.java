package com.codewithneal.brew_backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.codewithneal.brew_backend.service.BeerService;
import java.util.List;
import com.codewithneal.brew_backend.model.Beer;

@RestController
@RequestMapping("/api/beers")
public class BeerController {
    private final BeerService beerService;

    public BeerController(BeerService beerService) {
        this.beerService = beerService;
    }

    @GetMapping
    public List<Beer> getAllBeers() {
        return beerService.getBeers();
    }
}