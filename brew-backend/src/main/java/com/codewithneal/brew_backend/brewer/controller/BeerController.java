package com.codewithneal.brew_backend.brewer.controller;

import com.codewithneal.brew_backend.brewer.model.Beer;
import com.codewithneal.brew_backend.brewer.service.BrewerBeerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brewer/beers")
public class BeerController {

    private final BrewerBeerService beerService;

    public BeerController(BrewerBeerService beerService) {
        this.beerService = beerService;
    }

    // list all beers
    @GetMapping
    public List<Beer> getAllBeers() {
        return beerService.getAllBeers();
    }

    // add a beer
    @PostMapping
    public ResponseEntity<Beer> createBeer(@RequestBody Beer beer) {
        return ResponseEntity.ok(beerService.addBeer(beer));
    }

    // delete a beer entry by id
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBeer(@PathVariable String id) {
        boolean removed = beerService.removeBeer(id);
        if (removed) return ResponseEntity.noContent().build();
        else return ResponseEntity.notFound().build();
    }

    // delete all beer entries
    @DeleteMapping("/all")
    public ResponseEntity<?> deleteAllBeers() {
        beerService.removeAll();
        return ResponseEntity.noContent().build();
    }
}