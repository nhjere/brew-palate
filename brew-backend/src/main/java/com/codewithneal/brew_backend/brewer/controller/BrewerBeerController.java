package com.codewithneal.brew_backend.brewer.controller;

import com.codewithneal.brew_backend.CsvReader.beers.BeerCsv;
import com.codewithneal.brew_backend.CsvReader.beers.BeerCsvRepository;
import com.codewithneal.brew_backend.brewer.dto.BeerCreateRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/brewer/beers")
public class BrewerBeerController {

    private final BeerCsvRepository beerRepo;

    public BrewerBeerController(BeerCsvRepository beerRepo) {
        this.beerRepo = beerRepo;
    }

    // Create a beer
    @PostMapping
    public ResponseEntity<BeerCsv> create(@RequestBody BeerCreateRequest req) {
        BeerCsv beer = new BeerCsv();
        beer.setName(req.name);
        beer.setStyle(req.style);
        beer.setAbv(req.abv);
        beer.setIbu(req.ibu);
        beer.setPrice(req.price);
        beer.setBreweryUuid(req.breweryUuid);
        beer.setFlavorTags(req.flavorTags);  // @ElementCollection handles this

        BeerCsv saved = beerRepo.save(beer);
        return ResponseEntity.ok(saved);
    }

    // List beers by brewery for the brewer dashboard
    @GetMapping
    public ResponseEntity<List<BeerCsv>> listByBrewery(@RequestParam UUID breweryUuid) {
        return ResponseEntity.ok(beerRepo.findByBreweryUuid(breweryUuid));
    }

    // (Optional) Delete
    // @DeleteMapping("/{beerId}")
    // public ResponseEntity<Void> delete(@PathVariable UUID beerId, @RequestParam UUID breweryUuid) {
    //     return beerRepo.findById(beerId)
    //             .filter(b -> b.getBreweryUuid().equals(breweryUuid))
    //             .map(b -> { beerRepo.delete(b); return ResponseEntity.noContent().build(); })
    //             .orElse(ResponseEntity.notFound().build());
    // }
}
