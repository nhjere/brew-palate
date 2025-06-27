package com.codewithneal.brew_backend.brewer.controller;

import com.codewithneal.brew_backend.brewer.CSVreader.BeerCsvImporter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/import")

public class CsvImportController {

    @Autowired
    private BeerCsvImporter beerCsvImporter;

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
}
