package com.codewithneal.brew_backend.brewer.CsvReader.beers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.codewithneal.brew_backend.brewer.CsvReader.breweries.BreweryCsv;
import com.codewithneal.brew_backend.brewer.CsvReader.breweries.BreweryCsvImporter;
import com.codewithneal.brew_backend.brewer.CsvReader.breweries.BreweryCsvRepository;
import com.codewithneal.brew_backend.brewer.CsvReader.CompleteBeerDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.PageRequest;

import java.util.UUID;
import java.util.stream.Collectors;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/import")

public class CsvImportController {
    @Autowired
    private BeerCsvImporter beerCsvImporter;

    @Autowired
    private BeerCsvRepository beerCsvRepository;

    //import beers.csv
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

    @GetMapping("/api/import/complete-beers")
    public List<CompleteBeerDTO> getBeersWithBrewery() {
        List<BeerCsv> beers = beerCsvRepository.findAll();
        List<BreweryCsv> breweries = breweryCsvRepository.findAll();

        Map<String, String> breweryNameMap = breweries.stream()
            .collect(Collectors.toMap(BreweryCsv::getExternalBreweryId, BreweryCsv::getName));

        return beers.stream().map(beer -> {
            String breweryName = breweryNameMap.getOrDefault(beer.getBreweryId(), "Unknown Brewery");
            return new CompleteBeerDTO(
                beer.getBeerId(),
                beer.getName(),
                beer.getStyle(),
                beer.getAbv(),
                beer.getIbu(),
                beer.getFlavorTags(),
                beer.getBreweryId(),
                breweryName
            );
        }).collect(Collectors.toList());
    }

    @GetMapping("/beers/{beerId}")
    public ResponseEntity<CompleteBeerDTO> getBeerById(@PathVariable UUID beerId) {
        Optional<BeerCsv> beerOpt = beerCsvRepository.findById(beerId);
        if (beerOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        BeerCsv beer = beerOpt.get();
        String breweryName = breweryCsvRepository
            .findByExternalBreweryId(beer.getBreweryId())  // match external IDs
            .map(BreweryCsv::getName)
            .orElse("Unknown Brewery");

        CompleteBeerDTO dto = new CompleteBeerDTO(
            beer.getBeerId(),
            beer.getName(),
            beer.getStyle(),
            beer.getAbv(),
            beer.getIbu(),
            beer.getFlavorTags(),
            beer.getBreweryId(),
            breweryName
        );
        return ResponseEntity.ok(dto);
    }



}
