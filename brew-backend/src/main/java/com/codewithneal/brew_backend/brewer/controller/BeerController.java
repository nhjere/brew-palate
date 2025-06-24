package com.codewithneal.brew_backend.brewer.controller;

import com.codewithneal.brew_backend.brewer.model.Beer;
import com.codewithneal.brew_backend.brewer.service.BeerService;
import com.codewithneal.brew_backend.user.dto.UserBeerDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/brewer/beers")
public class BeerController {

    private final BeerService beerService;

    public BeerController(BeerService beerService) {
        this.beerService = beerService;
    }

    // list all beers
    @GetMapping
    public List<Beer> getAllBeers() {
        return beerService.getAllBeers();
    }

    // get info on one beer
    @GetMapping("/{beerId}")
    public ResponseEntity<Beer> getBeerById(@PathVariable UUID beerId) {
        Beer beer = beerService.getBeerById(beerId);
        return ResponseEntity.ok(beer);
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