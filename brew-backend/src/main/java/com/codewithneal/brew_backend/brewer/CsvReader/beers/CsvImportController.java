package com.codewithneal.brew_backend.brewer.CsvReader.beers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.codewithneal.brew_backend.brewer.CsvReader.breweries.BreweryCsv;
import com.codewithneal.brew_backend.brewer.CsvReader.breweries.BreweryCsvRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.PageRequest;

import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Collections;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/import")

public class CsvImportController {
    @Autowired
    private BeerCsvImporter beerCsvImporter;

    @Autowired
    private BeerCsvRepository beerCsvRepository;

    @Autowired 
    private NearbyBeerService nearbyBeerService;

    // import beers.csv
    @GetMapping("/beers")
    public String importBeersGet(@RequestParam(defaultValue = "src/main/resources/beers.csv") String path) {
        beerCsvImporter.importFromCsv(path);
        return "Beers imported via GET from: " + path;
    }

    // access beer by specific beer id
    @GetMapping("/beers/{beerId}")
    public ResponseEntity<BeerCsv> getBeerById(@PathVariable UUID beerId) {
        BeerCsv beer = beerCsvImporter.getBeerById(beerId);
        return ResponseEntity.ok(beer);
    }

    // get all flavor tags
    @GetMapping("/flavor-tags")
    public Set<String> getAllTags() {
        List<List<String>> allTags = beerCsvRepository.findAllFlavorTags();
        return allTags.stream()
                    .flatMap(List::stream)
                    .collect(Collectors.toSet());
    }

    // used by beer context (caching)
    @GetMapping("/all-beers")
    public List<BeerCsv> getAllBeers() {
        return beerCsvRepository.findAll();
    }

    // fetch beer by id
    @GetMapping("/fetchById")
    public ResponseEntity<?> getBeersById(@RequestParam(required = false) List<UUID> beerIds) {
        if (beerIds == null || beerIds.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

    List<BeerCsv> beers = beerCsvRepository.findAllById(beerIds);
    return ResponseEntity.ok(beers);
}


    // fetch all beers by brewery uuid
    @GetMapping("/by-brewery/{breweryUuid}")
    public List<BeerCsv> getBeersByBrewery(@PathVariable UUID breweryUuid) {
        return beerCsvRepository.findByBreweryUuid(breweryUuid);
    }



    // supports a paginated GET endpoint for .../show-beers/?page=0&size=20
    // payload found under key "content"
    @GetMapping("/show-beers")
    public Page<BeerCsv> getImportedBeers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return beerCsvRepository.findAll(pageable);
    }

    // show filtered beers
    @GetMapping("/filtered-beers")
    public Page<BeerCsv> getFilteredBeers(
        @RequestParam(required = false) List<String> tags,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        if (tags == null || tags.isEmpty()) {
            return beerCsvRepository.findAll(pageable);
        } else {
            return beerCsvRepository.findByAllTags(tags, tags.size(), pageable);
        }   
    }
    
    // calls beers in beers in user dashboard after filtering by location and tags
    @GetMapping("/filtered-all-beers")
    public ResponseEntity<Page<BeerCsv>> getFilteredBeers(
        @RequestParam(required = false) List<String> tags,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) Double lat,
        @RequestParam(required = false) Double lng,
        @RequestParam(defaultValue = "25") Double radius
    ) {
        Pageable pageable = PageRequest.of(page, size);

        if (lat != null && lng != null) {
            return ResponseEntity.ok(
                nearbyBeerService.findBeersByLocationAndTags(lat, lng, radius, tags, pageable)
            );
        }

        if (tags != null && !tags.isEmpty()) {
            return ResponseEntity.ok(
                beerCsvRepository.findByAllTags(tags, tags.size(), pageable)
            );
        }

        return ResponseEntity.ok(beerCsvRepository.findAll(pageable));
    }



    @Autowired
    private BreweryCsvRepository breweryCsvRepository;

    // supports a paginated GET endpoint for .../show-breweries/?page=0&size=20
    // payload found under key "content"
    @GetMapping("/show-breweries")
    public Page<BreweryCsv> getImportedBreweries(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return breweryCsvRepository.findAll(pageable);
    }

}
