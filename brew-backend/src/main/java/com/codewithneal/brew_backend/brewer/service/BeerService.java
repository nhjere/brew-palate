package com.codewithneal.brew_backend.brewer.service;

import com.codewithneal.brew_backend.brewer.model.Beer;
import com.codewithneal.brew_backend.brewer.repository.BeerRepository;
import com.codewithneal.brew_backend.user.dto.ReviewDTO;
import com.codewithneal.brew_backend.user.dto.UserBeerDTO;


import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class BeerService {

    private final BeerRepository beerRepository;

    public BeerService(BeerRepository beerRepository) {
        this.beerRepository = beerRepository;
    }

    // returns beer object by beer_id
    public Beer getBeerById(UUID beerId) {
        return beerRepository.findById(beerId)
            .orElseThrow(() -> new RuntimeException("Beer not found"));
    }

    public List<Beer> getAllBeers() {
        return beerRepository.findAll();
    }

    public Beer addBeer(Beer beer) {
        return beerRepository.save(beer);
    }

    public boolean removeBeer(String id) {
        UUID uuid = UUID.fromString(id);
        if (beerRepository.existsById(uuid)) {
            beerRepository.deleteById(uuid);
            return true;
        }
        return false;
    }

    public void removeAll() {
        beerRepository.deleteAll();
    }
}
