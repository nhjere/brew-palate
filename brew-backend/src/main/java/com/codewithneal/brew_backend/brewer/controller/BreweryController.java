package com.codewithneal.brew_backend.brewer.controller;

import com.codewithneal.brew_backend.brewer.dto.BreweryDTO;
import com.codewithneal.brew_backend.brewer.dto.BreweryMapper;
import com.codewithneal.brew_backend.brewer.model.Brewery;
import com.codewithneal.brew_backend.brewer.repository.BreweryRepository;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


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

    // return brewery object by specific id
    @GetMapping("/{breweryId}")
    public ResponseEntity<BreweryDTO> findBreweryById(@PathVariable UUID breweryId) {
        return breweryRepo.findById(breweryId)
            .map(brewery -> ResponseEntity.ok(BreweryMapper.toDTO(brewery)))
            .orElse(ResponseEntity.notFound().build());
    }
    // return all breweries
    @GetMapping("/all")
    public ResponseEntity<List<Brewery>> getAllBreweries() {
        List<Brewery> breweries = breweryRepo.findAll();
        return ResponseEntity.ok(breweries);
    }


    // writes all breweries to db
    @PostMapping("/seed/all")
    public ResponseEntity<String> seedAllBreweries() {
        RestTemplate restTemplate = new RestTemplate();
        List<Brewery> allBreweries = new ArrayList<>();
        int page = 1;
        int totalFetched = 0;

        while (true) {
            String url = "https://api.openbrewerydb.org/v1/breweries?per_page=200&page=" + page;
            try {
                ResponseEntity<BreweryDTO[]> response = restTemplate.getForEntity(url, BreweryDTO[].class);
                BreweryDTO[] dtoArray = response.getBody();

                if (dtoArray == null || dtoArray.length == 0) {
                    break; // No more data
                }

                List<Brewery> batch = Arrays.stream(dtoArray)
                    .map(BreweryMapper::toEntity)
                    .toList();

                allBreweries.addAll(batch);
                totalFetched += batch.size();
                page++;

            } catch (Exception e) {
                return ResponseEntity.internalServerError()
                    .body("Failed at page " + page + ": " + e.getMessage());
            }
        }

        breweryRepo.saveAll(allBreweries);
        return ResponseEntity.ok("Successfully imported " + totalFetched + " breweries.");
    }



}

