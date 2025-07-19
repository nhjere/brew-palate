package com.codewithneal.brew_backend.brewer.controller;

import com.codewithneal.brew_backend.brewer.dto.BreweryDTO;
import com.codewithneal.brew_backend.brewer.dto.BreweryMapper;
import com.codewithneal.brew_backend.brewer.model.Brewer;
import com.codewithneal.brew_backend.brewer.model.Brewery;
import com.codewithneal.brew_backend.brewer.repository.BreweryRepository;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;


@RestController
@RequestMapping("/api/brewer/breweries")
public class BreweryController {

    private final BreweryRepository breweryRepo;

    public BreweryController(BreweryRepository breweryRepo) {

        this.breweryRepo = breweryRepo;
    }

    @PostMapping()
    public ResponseEntity<List<Brewery>> createBreweries(@RequestBody List<BreweryDTO> breweryDTOs) {
        List<Brewery> breweries = breweryDTOs.stream()
        .map(BreweryMapper::toEntity)
        .toList();

        List<Brewery> saved = breweryRepo.saveAll(breweries);
        return ResponseEntity.ok(saved);
    }

    // calls by_dist api from open brewery db
    @GetMapping("/nearby")
    public ResponseEntity<List<Brewery>> findNearbyBreweries(
        @RequestParam("lat") double latitude,
        @RequestParam("lng") double longitude,
        @RequestParam(defaultValue = "25") double radius
    ) {
        List<Brewery> nearbyBreweries = breweryRepo.findByDistance(latitude, longitude, radius);
        return ResponseEntity.ok(nearbyBreweries);
    }

    @GetMapping
    public ResponseEntity<List<Brewery>> getAllBreweries() {
        List<Brewery> breweries = breweryRepo.findAll();
        return ResponseEntity.ok(breweries);
    }
}

