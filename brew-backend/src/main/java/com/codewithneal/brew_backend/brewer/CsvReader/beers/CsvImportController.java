package com.codewithneal.brew_backend.brewer.CsvReader.beers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.codewithneal.brew_backend.brewer.CsvReader.breweries.BreweryCsv;
import com.codewithneal.brew_backend.brewer.CsvReader.breweries.BreweryCsvImporter;
import com.codewithneal.brew_backend.brewer.CsvReader.breweries.BreweryCsvRepository;
import com.codewithneal.brew_backend.brewer.service.BeerService;
import com.codewithneal.brew_backend.brewer.CsvReader.CompleteBeerDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.PageRequest;

import java.util.UUID;
import java.util.stream.Collectors;

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
    public Set<String> getAllTags() {
        List<List<String>> allTags = beerCsvRepository.findAllFlavorTags();
        return allTags.stream()
                    .flatMap(List::stream)
                    .collect(Collectors.toSet());
    }

    @GetMapping("/all-beers")
    public List<BeerCsv> getAllBeers() {
        return beerCsvRepository.findAll();
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
    
    
    // import breweries.csv
    @Autowired
    private BreweryCsvImporter breweryCsvImporter;

    @Autowired
    private BreweryCsvRepository breweryCsvRepository;

    @PostMapping("/breweries")
    public String importBreweries(@RequestParam(defaultValue = "src/main/resources/breweries.csv") String path) {
        breweryCsvImporter.importFromCsv(path);
        return "Breweries imported from: " + path;
    }

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
