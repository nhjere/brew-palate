package com.codewithneal.brew_backend.brewer.service;

import com.codewithneal.brew_backend.brewer.model.Beer;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class BeerService {
    private final List<Beer> beers = new ArrayList<>();

    public List<Beer> getAllBeers() {
        return beers;
    }

    public Beer addBeer(Beer beer) {
        beer.setId(UUID.randomUUID().toString());
        beers.add(beer);
        return beer;
    }

    public boolean removeBeer(String id) {
        return beers.removeIf(beer -> beer.getId().equals(id));
    }
}
