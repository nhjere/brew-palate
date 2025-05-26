package com.codewithneal.brew_backend.user.controller;

import com.codewithneal.brew_backend.user.dto.BreweryDTO;
import com.codewithneal.brew_backend.user.dto.BreweryMapper;
import com.codewithneal.brew_backend.user.model.Brewery;
import com.codewithneal.brew_backend.user.repository.BreweryRepository;
import com.codewithneal.brew_backend.user.service.UserBreweryService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user/breweries")
public class UserBreweryController {

    private final UserBreweryService breweryService;
    private final BreweryRepository breweryRepo;

    public UserBreweryController(UserBreweryService breweryService, BreweryRepository breweryRepo) {
        this.breweryService = breweryService;
        this.breweryRepo = breweryRepo;
    }

    @GetMapping
    public List<Brewery> getAllBreweries() {
        return breweryService.getAllBreweries();
    }

    // will delete later (should not be open to user-side) just to seed breweries during testing
    @PostMapping
    public ResponseEntity<List<Brewery>> createBreweries(@RequestBody List<BreweryDTO> breweryDTOs) {
        List<Brewery> breweries = breweryDTOs.stream()
            .map(BreweryMapper::toEntity)
            .collect(Collectors.toList());

        List<Brewery> saved = breweryRepo.saveAll(breweries);
        return ResponseEntity.ok(saved);
    }

}
