package com.codewithneal.brew_backend.brewer.service.impl;

import com.codewithneal.brew_backend.brewer.model.Beer;
import com.codewithneal.brew_backend.brewer.service.BrewerBeerService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class BrewerBeerServiceImpl implements BrewerBeerService {

    private final List<Beer> beers = new ArrayList<>();

    @Override
    public List<Beer> getAllBeers() {
        return beers;
    }

    @Override
    public Beer addBeer(Beer beer) {
        beer.setId(UUID.randomUUID().toString());
        beers.add(beer);
        return beer;
    }

    @Override
    public boolean removeBeer(String id) {
        return beers.removeIf(b -> b.getId().equals(id));
    }
}
