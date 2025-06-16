package com.codewithneal.brew_backend.brewer.controller;

import com.codewithneal.brew_backend.brewer.dto.BreweryDTO;
import com.codewithneal.brew_backend.brewer.dto.BreweryMapper;
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

    @PostMapping
    public ResponseEntity<List<Brewery>> createBreweries(@RequestBody List<BreweryDTO> breweryDTOs) {


        List<Brewery> breweries = breweryDTOs.stream()
        .map(BreweryMapper::toEntity)
        .toList();

        List<Brewery> saved = breweryRepo.saveAll(breweries);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Brewery>> getAllBreweries() {
        List<Brewery> breweries = breweryRepo.findAll();
        return ResponseEntity.ok(breweries);
    }
}

