package com.codewithneal.brew_backend.brewer.controller;

import com.codewithneal.brew_backend.brewer.dto.BeerCreateRequest;
import com.codewithneal.brew_backend.brewer.dto.BeerUpdateRequest;
import com.codewithneal.brew_backend.brewer.dto.BreweryDTO;
import com.codewithneal.brew_backend.brewer.dto.NearbyBreweryDTO;
import com.codewithneal.brew_backend.brewer.dto.BreweryMapper;
import com.codewithneal.brew_backend.brewer.model.Brewery;
import com.codewithneal.brew_backend.brewer.repository.BreweryRepository;
import com.codewithneal.brew_backend.user.repository.UserRepository;


import jakarta.validation.Valid;

import com.codewithneal.brew_backend.user.model.User;
import com.codewithneal.brew_backend.GeocodingService;
import com.codewithneal.brew_backend.JwtService;
import com.codewithneal.brew_backend.CsvReader.beers.BeerCsv;
import com.codewithneal.brew_backend.CsvReader.beers.BeerCsvRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Optional;

import org.springframework.http.ResponseEntity;

import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/brewer/breweries")
public class BreweryController {

    private final BreweryRepository breweryRepo;
    private final UserRepository userRepo;
    private final JwtService jwtService;
    private final BeerCsvRepository beerCsvRepository;
    private final GeocodingService geocodingService;

    public BreweryController(BreweryRepository breweryRepo, UserRepository userRepo,  JwtService jwtService, BeerCsvRepository beerCsvRepository, GeocodingService geocodingService) {
        this.breweryRepo = breweryRepo;
        this.userRepo = userRepo;
        this.jwtService = jwtService;
        this.beerCsvRepository = beerCsvRepository;
        this.geocodingService = geocodingService;
    }

    /* BREWERY INFORMATION FUNCTIONS  */

    // creates a brewery and sets the user to owning a brewery
    // called in BreweryModal.jsx
    @PostMapping("/create")
    public ResponseEntity<BreweryDTO> createBrewery(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody BreweryDTO dto
    ) {
        UUID userId = jwtService.requireUserId(authHeader);
        Brewery entity = BreweryMapper.fromCreateDTO(dto);

        geocodingService.geocode(entity.getStreet(), entity.getCity(),
                                entity.getState(), entity.getPostalCode())
        .ifPresent(ll -> { entity.setLatitude(ll.lat()); entity.setLongitude(ll.lon()); });

        Brewery saved = breweryRepo.save(entity);
        userRepo.setHasBreweryAndId(userId, saved.getBreweryId());

        return ResponseEntity
            .created(URI.create("/api/brewer/breweries/" + saved.getBreweryId()))
            .body(BreweryMapper.toDTO(saved));
    }

    // updates any brewery fields that brewer changes
    // called in BreweryCard.jsx
    @PatchMapping("/update")
    public ResponseEntity<BreweryDTO> updateBrewery(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody BreweryDTO dto
    ) {
        UUID userId = jwtService.requireUserId(authHeader);
        var user = userRepo.findById(userId).orElse(null);
        if (user == null || !user.isHasBrewery() || user.getBreweryId() == null) return ResponseEntity.notFound().build();
        var brewery = breweryRepo.findById(user.getBreweryId()).orElse(null);
        if (brewery == null) return ResponseEntity.notFound().build();
        if (dto.getIdString() != null && !user.getBreweryId().equals(dto.getBreweryId())) return ResponseEntity.status(403).build();

        boolean addrChanged = dto.getStreet() != null || dto.getCity() != null ||
                            dto.getState() != null || dto.getPostalCode() != null;

        BreweryMapper.applyPatch(brewery, dto);

        if (addrChanged) {
        geocodingService.geocode(brewery.getStreet(), brewery.getCity(),
                                brewery.getState(), brewery.getPostalCode())
            .ifPresentOrElse(
            ll -> { brewery.setLatitude(ll.lat()); brewery.setLongitude(ll.lon()); },
            ()  -> { brewery.setLatitude(null); brewery.setLongitude(null); }
            );
        }

        var saved = breweryRepo.save(brewery);
        return ResponseEntity.ok(BreweryMapper.toDTO(saved));
    }


    // returns the status (TRUE / FALSE) for having a brewery and its metadata
    // called in BrewerDashboard.jsx
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> brewerStatus(
        @RequestHeader("Authorization") String authHeader
    ) {
        UUID userId = jwtService.requireUserId(authHeader);

        // 1) find user profile
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("hasBrewery", false));
        }

        User user = userOpt.get();
        if (!user.isHasBrewery() || user.getBreweryId() == null) {
            return ResponseEntity.ok(Map.of("hasBrewery", false));
        }

        // 2) load the brewery metadata and map to DTO
        return breweryRepo.findById(user.getBreweryId())
            .map(b -> ResponseEntity.ok(Map.of(
                "hasBrewery", true,
                "brewery", BreweryMapper.toDTO(b)   
            )))
            .orElse(ResponseEntity.ok(Map.of("hasBrewery", false)));
    }

    /* BEER CATALOG BREWERY FUNCTIONS */

    // brewer can create a beer
    // called in brewer dashboard
    @PostMapping("/create/beer")
    @Transactional
    public ResponseEntity<?> createBeer(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody BeerCreateRequest in
    ) {
        UUID userId = jwtService.requireUserId(authHeader);
        var user = userRepo.findById(userId).orElse(null);
        if (user == null || user.getBreweryId() == null || !user.getBreweryId().equals(in.breweryUuid())) {
            return ResponseEntity.status(403).body(Map.of("message", "Brewery mismatch or brewer not set"));
        }

        var beer = new com.codewithneal.brew_backend.CsvReader.beers.BeerCsv();
        beer.setName(in.name().trim());
        beer.setStyle(in.style().trim());
        beer.setAbv(Math.max(0.0, Math.min(in.abv(), 1.0))); // fraction 0–1
        beer.setIbu(in.ibu());
        beer.setOunces(in.ounces());
        beer.setPrice(in.price());
        beer.setBreweryUuid(in.breweryUuid());
        if (in.flavorTags() != null) beer.setFlavorTags(in.flavorTags());

        try {
            var saved = beerCsvRepository.save(beer);
            return ResponseEntity
                    .created(URI.create("/api/import/beers/" + saved.getBeerId()))
                    .body(saved);
        } catch (DataIntegrityViolationException dup) {
            return ResponseEntity.status(409).body(Map.of("message", "Beer already exists for this brewery"));
        }
    }

    // delete beer
    @DeleteMapping("/remove/beer/{beerId}")
    @Transactional
    public ResponseEntity<?> removeBeer(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("beerId") UUID beerId
    ) {
        UUID userId = jwtService.requireUserId(authHeader);
        var user = userRepo.findById(userId).orElse(null);

        if (user == null || user.getBreweryId() == null) {
            return ResponseEntity.status(403).body(Map.of("message", "User not linked to a brewery"));
        }

        var beer = beerCsvRepository.findById(beerId).orElse(null);
        if (beer == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Beer not found"));
        }

        if (!beer.getBreweryUuid().equals(user.getBreweryId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized to delete this beer"));
        }

        beerCsvRepository.deleteById(beerId);
        return ResponseEntity.ok(Map.of("message", "Beer removed successfully"));
    }

    // update beer in catalog
    @PatchMapping("/update/beer/{beerId}")
    @Transactional
    public ResponseEntity<?> updateBeer(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("beerId") UUID beerId,
            @RequestBody BeerUpdateRequest paylaod
    ) {
        UUID userId = jwtService.requireUserId(authHeader);
        var user = userRepo.findById(userId).orElse(null);

        if (user == null || user.getBreweryId() == null) {
            return ResponseEntity.status(403).body(Map.of("message", "User not linked to a brewery"));
        }

        var beer = beerCsvRepository.findById(beerId).orElse(null);
        if (beer == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Beer not found"));
        }

        if (!beer.getBreweryUuid().equals(user.getBreweryId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized to delete this beer"));
        }
        
        if (paylaod.name() != null)  beer.setName(paylaod.name().trim());
        if (paylaod.style() != null) beer.setStyle(paylaod.style().trim());
        if (paylaod.abv() != null)   beer.setAbv(Math.max(0.0, Math.min(paylaod.abv(), 1.0)));
        if (paylaod.ibu() != null)   beer.setIbu(paylaod.ibu().doubleValue());
        if (paylaod.ounces() != null) beer.setOunces(paylaod.ounces());
        if (paylaod.price() != null)  beer.setPrice(paylaod.price());
        if (paylaod.flavorTags() != null) beer.setFlavorTags(paylaod.flavorTags());

        
        return ResponseEntity.ok(Map.of("message", "Beer removed successfully"));

    }


    // returns breweries within set radius
    // called in FindBreweries.jsx
    @GetMapping("/nearby")
    public ResponseEntity<List<NearbyBreweryDTO>> findNearbyBreweries(
        @RequestParam("lat") double latitude,
        @RequestParam("lng") double longitude,
        @RequestParam(defaultValue = "25") double radius
    ) {
        List<NearbyBreweryDTO> nearbyBreweries = breweryRepo.findNearbyWithDistance(latitude, longitude, radius);
        return ResponseEntity.ok(nearbyBreweries);
    }

    // return brewery object by specific id
    @GetMapping("/{breweryId}")
    public ResponseEntity<BreweryDTO> findBreweryById(@PathVariable UUID breweryId) {
        return breweryRepo.findById(breweryId)
            .map(brewery -> ResponseEntity.ok(BreweryMapper.toDTO(brewery)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/details")
    public Map<UUID, BreweryDTO> getBreweryDetails(@RequestBody List<UUID> breweryIds) {
        return breweryRepo.findAllById(breweryIds).stream()
            .filter(b -> b.getBreweryName() != null && !b.getBreweryName().isBlank())
            .collect(Collectors.toMap(
                Brewery::getBreweryId,
                BreweryMapper::toDTO
            ));
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

