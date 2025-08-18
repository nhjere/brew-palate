package com.codewithneal.brew_backend.CsvReader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.codewithneal.brew_backend.CsvReader.beers.BeerCsv;
import com.codewithneal.brew_backend.CsvReader.beers.BeerCsvImporter;
import com.codewithneal.brew_backend.CsvReader.beers.BeerCsvRepository;
import com.codewithneal.brew_backend.CsvReader.beers.BeerListItem;

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
    public ResponseEntity<List<String>> getFlavorTags() {
        return ResponseEntity.ok(beerCsvRepository.findAllUniqueFlavorTags());
    }

     // get most popular styles
    @GetMapping("/styles")
    public ResponseEntity<List<String>> getStyles() {
        return ResponseEntity.ok(beerCsvRepository.findAllUniqueStyles());
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

    // calls beers in beers in user dashboard after filtering by location and tags
    @GetMapping("/filtered-all-beers")
    public ResponseEntity<Page<BeerListItem>> getFilteredBeers(
        @RequestParam(required = false) List<String> tags,
        @RequestParam(required = false) List<String> styles,   // NEW
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) Double lat,
        @RequestParam(required = false) Double lng,
        @RequestParam(defaultValue = "25") Double radius // miles
    ) {
        Pageable pageable = PageRequest.of(page, size);

        final boolean hasGeo    = lat != null && lng != null;
        final boolean hasTags   = tags != null && !tags.isEmpty();
        final boolean hasStyles = styles != null && !styles.isEmpty();

        final double radiusMeters = radius * 1609.344;

        Page<BeerListItem> out;

        if (hasGeo && hasTags && hasStyles) {
            String[] tagArr = tags.stream().map(String::toLowerCase).toArray(String[]::new);
            String[] stylePatterns = styles.stream()
                .map(s -> "%" + s.toLowerCase() + "%").toArray(String[]::new);
            out = beerCsvRepository.findNearbyWithAnyTagsAndAnyStylesList(
                    lat, lng, radiusMeters, tagArr, stylePatterns, pageable);

        } else if (hasGeo && hasTags) {
            String[] tagArr = tags.stream().map(String::toLowerCase).toArray(String[]::new);
            out = beerCsvRepository.findNearbyWithAnyTagsList(lat, lng, radiusMeters, tagArr, pageable);

        } else if (hasGeo && hasStyles) {
            String[] stylePatterns = styles.stream()
                .map(s -> "%" + s.toLowerCase() + "%").toArray(String[]::new);
            out = beerCsvRepository.findNearbyWithAnyStylesList(
                    lat, lng, radiusMeters, stylePatterns, pageable);

        } else if (hasGeo) {
            out = beerCsvRepository.findNearbyList(lat, lng, radiusMeters, pageable);

        } else if (hasTags && hasStyles) {
            String[] tagArr = tags.stream().map(String::toLowerCase).toArray(String[]::new);
            String[] stylePatterns = styles.stream()
                .map(s -> "%" + s.toLowerCase() + "%").toArray(String[]::new);
            out = beerCsvRepository.findByAnyTagsAndAnyStylesList(tagArr, stylePatterns, pageable);

        } else if (hasTags) {
            String[] tagArr = tags.stream().map(String::toLowerCase).toArray(String[]::new);
            out = beerCsvRepository.findByAnyTagsList(tagArr, pageable);

        } else if (hasStyles) {
            String[] stylePatterns = styles.stream()
                .map(s -> "%" + s.toLowerCase() + "%").toArray(String[]::new);
            out = beerCsvRepository.findByAnyStylesList(stylePatterns, pageable);

        } else {
            out = beerCsvRepository.findAllList(pageable);
        }

        return ResponseEntity.ok(out);
    }





}
