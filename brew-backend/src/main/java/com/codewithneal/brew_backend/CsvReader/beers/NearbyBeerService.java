package com.codewithneal.brew_backend.CsvReader.beers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import com.codewithneal.brew_backend.brewer.dto.NearbyBreweryDTO;
import com.codewithneal.brew_backend.brewer.repository.BreweryRepository;

import java.util.*;

@Service
public class NearbyBeerService {

    @Autowired
    private BeerCsvRepository beerCsvRepository;

    @Autowired
    private BreweryRepository brewryRepo;

    public Page<BeerCsv> findBeersByLocationAndTags(
        double lat,
        double lng,
        double radius,
        List<String> tags,
        Pageable pageable
    ) {
        // Step 1: Get nearby brewery UUIDs
        List<NearbyBreweryDTO> nearbyBreweries = brewryRepo.findNearbyWithDistance(lat, lng, radius);
        List<UUID> breweryUuids = nearbyBreweries.stream()
            .map(NearbyBreweryDTO::getBreweryId)
            .toList();

        if (breweryUuids.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }

        // Step 2: Fetch beers by brewery UUIDs (paged)
        List<BeerCsv> filteredBeers = beerCsvRepository.findByBreweryUuidIn(breweryUuids);

        // Step 3: Apply flavor tag filtering if applicable
        if (tags != null && !tags.isEmpty()) {
            filteredBeers = filteredBeers.stream()
                .filter(beer -> beer.getFlavorTags() != null &&
                    beer.getFlavorTags().stream().anyMatch(tags::contains))
                .toList();
        }

        // Step 4: Manual pagination of filtered results
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filteredBeers.size());
        List<BeerCsv> pageContent = start > end ? List.of() : filteredBeers.subList(start, end);

        return new PageImpl<>(pageContent, pageable, filteredBeers.size());
    }
}
