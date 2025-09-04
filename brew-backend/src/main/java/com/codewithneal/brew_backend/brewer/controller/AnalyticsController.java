package com.codewithneal.brew_backend.brewer.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.codewithneal.brew_backend.CsvReader.beers.BeerCsvRepository;
import com.codewithneal.brew_backend.brewer.repository.BreweryRepository;
import com.codewithneal.brew_backend.user.model.Review;
import com.codewithneal.brew_backend.user.repository.ReviewRepository;



@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    
    private final BreweryRepository breweryRepo;
    private final ReviewRepository reviewRepo;
    private final BeerCsvRepository beerCsvRepository;

    public AnalyticsController(BreweryRepository breweryRepo, ReviewRepository reviewRepo, BeerCsvRepository beerCsvRepo) {
        this.breweryRepo = breweryRepo;
        this.reviewRepo = reviewRepo;
        this.beerCsvRepository = beerCsvRepo;
    }


    // GET /api/analytics/reviews?beerIds=<uuid1>,<uuid2>,<uuid3>
    @GetMapping("/reviews")
    public ResponseEntity<List<Review>> getReviewsByBeerIds(
            @RequestParam("beerIds") List<UUID> beerIds) {
        if (beerIds == null || beerIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(reviewRepo.findByBeerIdIn(beerIds));
    }
    


}
