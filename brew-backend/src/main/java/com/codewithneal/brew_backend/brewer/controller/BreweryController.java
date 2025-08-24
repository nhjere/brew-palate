package com.codewithneal.brew_backend.brewer.controller;

import com.codewithneal.brew_backend.brewer.dto.BreweryDTO;
import com.codewithneal.brew_backend.brewer.dto.NearbyBreweryDTO;
import com.codewithneal.brew_backend.brewer.dto.BreweryMapper;
import com.codewithneal.brew_backend.brewer.model.Brewery;
import com.codewithneal.brew_backend.brewer.repository.BreweryRepository;
import com.codewithneal.brew_backend.user.repository.UserRepository;
import com.codewithneal.brew_backend.user.model.User;
import com.codewithneal.brew_backend.JwtService;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Optional;

import org.springframework.boot.autoconfigure.security.oauth2.resource.OAuth2ResourceServerProperties.Jwt;
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

    public BreweryController(BreweryRepository breweryRepo, UserRepository userRepo,  JwtService jwtService) {
        this.breweryRepo = breweryRepo;
        this.userRepo = userRepo;
        this.jwtService = jwtService;
    }

    // creates a brewery and sets the user to owning a brewery
    @PostMapping("/create")
    public ResponseEntity<BreweryDTO> createBrewery(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody BreweryDTO dto
    ) {
        // Convert header to UUID (Supabase user id is a UUID string)
        UUID userId = jwtService.requireUserId(authHeader);

        Brewery entity = BreweryMapper.fromCreateDTO(dto); 
        entity.setLatitude(null);
        entity.setLongitude(null);

        Brewery saved = breweryRepo.save(entity);

        // remember it on the user profile
        userRepo.setHasBreweryAndId(userId, saved.getBreweryId());

        return ResponseEntity
            .created(URI.create("/api/brewer/breweries/" + saved.getBreweryId()))
            .body(BreweryMapper.toDTO(saved));
    }

    // GET /api/brewer/breweries/status
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
                "brewery", BreweryMapper.toDTO(b)   // { id/name/city/state/... }
            )))
            .orElse(ResponseEntity.ok(Map.of("hasBrewery", false)));
    }




    // calls by_dist api from open brewery db
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

