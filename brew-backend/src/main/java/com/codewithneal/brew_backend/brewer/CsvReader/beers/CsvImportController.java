package com.codewithneal.brew_backend.brewer.CsvReader.beers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.codewithneal.brew_backend.brewer.CsvReader.breweries.BreweryCsv;
import com.codewithneal.brew_backend.brewer.CsvReader.breweries.BreweryCsvImporter;
import com.codewithneal.brew_backend.brewer.CsvReader.breweries.BreweryCsvRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;

@RestController
@RequestMapping("/api/import")

public class CsvImportController {

    //import beers.csv
    @Autowired
    private BeerCsvImporter beerCsvImporter;

    @Autowired
    private BeerCsvRepository beerCsvRepository;

    @PostMapping("/beers")
    public String importBeers(@RequestParam(defaultValue = "src/main/resources/beers.csv") String path) {
        beerCsvImporter.importFromCsv(path);
        return "Beers imported successfully from: " + path;
    }

    @GetMapping("/beers")
    public String importBeersGet(@RequestParam(defaultValue = "src/main/resources/beers.csv") String path) {
        beerCsvImporter.importFromCsv(path);
        return "Beers imported via GET from: " + path;
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
