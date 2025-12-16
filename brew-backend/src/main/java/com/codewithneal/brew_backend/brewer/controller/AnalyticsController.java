package com.codewithneal.brew_backend.brewer.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Arrays;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.codewithneal.brew_backend.CsvReader.beers.BeerCsv;
import com.codewithneal.brew_backend.CsvReader.beers.BeerCsvRepository;
import com.codewithneal.brew_backend.JwtService;
import com.codewithneal.brew_backend.brewer.repository.BreweryRepository;
import com.codewithneal.brew_backend.user.model.Review;
import com.codewithneal.brew_backend.user.repository.ReviewRepository;
import com.codewithneal.brew_backend.user.repository.UserRepository;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    
    private final BreweryRepository breweryRepo;
    private final ReviewRepository reviewRepo;
    private final BeerCsvRepository beerCsvRepository;
    private final UserRepository userRepo;
    private final JwtService jwtService;

    public AnalyticsController(BreweryRepository breweryRepo, ReviewRepository reviewRepo, 
                              BeerCsvRepository beerCsvRepo, UserRepository userRepo, JwtService jwtService) {
        this.breweryRepo = breweryRepo;
        this.reviewRepo = reviewRepo;
        this.beerCsvRepository = beerCsvRepo;
        this.userRepo = userRepo;
        this.jwtService = jwtService;
    }

    // Single endpoint for complete brewery analytics
    @GetMapping("/brewery-dashboard")
    public ResponseEntity<BreweryAnalytics> getBreweryAnalytics(
            @RequestHeader("Authorization") String authHeader) {
        
        try {
            UUID userId = jwtService.requireUserId(authHeader);
            
            // Get user and verify they have a brewery
            var user = userRepo.findById(userId).orElse(null);
            if (user == null || !user.isHasBrewery() || user.getBreweryId() == null) {
                return ResponseEntity.ok(new BreweryAnalytics(null, null, List.of(), 0, 0.0));
            }

            UUID breweryId = user.getBreweryId();
            var brewery = breweryRepo.findById(breweryId).orElse(null);
            
            // Get all beers for this brewery
            var beers = beerCsvRepository.findByBreweryUuid(breweryId);
            if (beers.isEmpty()) {
                return ResponseEntity.ok(new BreweryAnalytics(breweryId, 
                    brewery != null ? brewery.getBreweryName() : null, List.of(), 0, 0.0));
            }

            // Extract beer IDs
            var beerIds = beers.stream()
                .map(BeerCsv::getBeerId)
                .collect(Collectors.toList());

            // Get all reviews for these beers in one query
            var allReviews = reviewRepo.findByBeerIdIn(beerIds);

            // Group reviews by beer ID for efficient processing
            var reviewsByBeerId = allReviews.stream()
                .collect(Collectors.groupingBy(Review::getBeerId));

            // Process each beer with its reviews
            var beerAnalytics = beers.stream()
                .map(beer -> processBeerAnalytics(beer, reviewsByBeerId.get(beer.getBeerId())))
                .collect(Collectors.toList());

            // Calculate brewery-wide statistics - FIXED for primitive int
            int totalReviews = allReviews.size();
            double avgBreweryRating = allReviews.stream()
                .mapToInt(Review::getOverallEnjoyment)  // No null check for primitive int
                .average()
                .orElse(0.0);

            return ResponseEntity.ok(new BreweryAnalytics(
                breweryId,
                brewery != null ? brewery.getBreweryName() : "Unknown Brewery",
                beerAnalytics,
                totalReviews,
                avgBreweryRating
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    private BeerAnalytics processBeerAnalytics(BeerCsv beer, List<Review> reviews) {
        if (reviews == null) {
            reviews = List.of();
        }

        // Calculate average rating
        double avgRating = reviews.stream()
            .mapToInt(Review::getOverallEnjoyment)  // No null check needed for primitive int
            .average()
            .orElse(0.0);

        // Process flavor tags
        var allTags = reviews.stream()
            .filter(review -> review.getFlavorTags() != null)
            .flatMap(review -> review.getFlavorTags().stream())
            .collect(Collectors.toList());

        var tagCounts = processTagCounts(allTags);

        // Convert reviews to DTOs (limit data sent to frontend)
        var reviewDtos = reviews.stream()
            .map(this::convertToReviewDto)
            .collect(Collectors.toList());

        return new BeerAnalytics(
            beer.getBeerId(),
            beer.getName(),
            beer.getStyle(),
            beer.getAbv(),
            beer.getIbu(),
            beer.getOunces(),
            beer.getPrice(),
            avgRating,
            reviews.size(),
            tagCounts.positive,
            tagCounts.negative,
            reviewDtos
        );
    }

    private TagCounts processTagCounts(List<String> allTags) {
        var positiveTags = Arrays.asList("Balanced", "Smooth", "Refreshing", "Bold Flavor", "Light & Easy", "Clean Finish");
        var negativeTags = Arrays.asList("Too Bitter", "Too Sweet", "Watery", "Harsh Finish", "Off Taste", "Flat");

        var positiveTagCounts = allTags.stream()
            .filter(positiveTags::contains)
            .collect(Collectors.groupingBy(tag -> tag, Collectors.counting()));

        var negativeTagCounts = allTags.stream()
            .filter(negativeTags::contains)
            .collect(Collectors.groupingBy(tag -> tag, Collectors.counting()));

        return new TagCounts(
            positiveTagCounts.entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().intValue())),
            negativeTagCounts.entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().intValue()))
        );
    }

    private ReviewDto convertToReviewDto(Review review) {
        return new ReviewDto(
            review.getReviewId(),
            review.getBeerId(),
            review.getOverallEnjoyment(),  // No null check needed for primitive int
            review.getFlavorTags(),
            review.getComment()
        );
    }

    // Keep the original endpoint for backward compatibility if needed
    @GetMapping("/reviews")
    public ResponseEntity<List<Review>> getReviewsByBeerIds(
            @RequestParam("beerIds") List<UUID> beerIds) {
        if (beerIds == null || beerIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(reviewRepo.findByBeerIdIn(beerIds));
    }

    // Lightweight stats endpoint for overview only
    @GetMapping("/brewery-stats")
    public ResponseEntity<BreweryStats> getBreweryStats(
            @RequestHeader("Authorization") String authHeader) {
        
        try {
            UUID userId = jwtService.requireUserId(authHeader);
            var user = userRepo.findById(userId).orElse(null);
            
            if (user == null || !user.isHasBrewery() || user.getBreweryId() == null) {
                return ResponseEntity.ok(new BreweryStats(null, null, 0, 0, 0.0));
            }

            UUID breweryId = user.getBreweryId();
            var brewery = breweryRepo.findById(breweryId).orElse(null);
            var beers = beerCsvRepository.findByBreweryUuid(breweryId);
            
            if (beers.isEmpty()) {
                return ResponseEntity.ok(new BreweryStats(breweryId, 
                    brewery != null ? brewery.getBreweryName() : null, 0, 0, 0.0));
            }

            var beerIds = beers.stream().map(BeerCsv::getBeerId).collect(Collectors.toList());
            var allReviews = reviewRepo.findByBeerIdIn(beerIds);
            
            // FIXED for primitive int
            double avgRating = allReviews.stream()
                .mapToInt(Review::getOverallEnjoyment)
                .average()
                .orElse(0.0);

            return ResponseEntity.ok(new BreweryStats(
                breweryId,
                brewery != null ? brewery.getBreweryName() : "Unknown Brewery",
                beers.size(),
                allReviews.size(),
                avgRating
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // DTO Records
    public record BreweryAnalytics(
        UUID breweryId,
        String breweryName,
        List<BeerAnalytics> beers,
        int totalReviews,
        double avgBreweryRating
    ) {}

    public record BeerAnalytics(
        UUID beerId,
        String name,
        String style,
        Double abv,
        Double ibu,
        Double ounces,
        Double price,
        double avgRating,
        int reviewCount,
        Map<String, Integer> positiveTagCounts,
        Map<String, Integer> negativeTagCounts,
        List<ReviewDto> reviews
    ) {}

    public record BreweryStats(
        UUID breweryId,
        String breweryName,
        int totalBeers,
        int totalReviews,
        double avgBreweryRating
    ) {}

    public record TagCounts(
        Map<String, Integer> positive,
        Map<String, Integer> negative
    ) {}

    public record ReviewDto(
        UUID reviewId,
        UUID beerId,
        int overallEnjoyment,  // Changed from Integer to int (primitive)
        List<String> flavorTags,
        String comment
    ) {}
}