package com.codewithneal.brew_backend.brewer.service.impl;

import com.codewithneal.brew_backend.brewer.model.Beer;
import com.codewithneal.brew_backend.brewer.repository.BeerRepository;
import com.codewithneal.brew_backend.brewer.service.BrewerBeerService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class BrewerBeerServiceImpl implements BrewerBeerService {

    private final BeerRepository beerRepository;

    public BrewerBeerServiceImpl(BeerRepository beerRepository) {
        this.beerRepository = beerRepository;
    }

    @Override
    public List<Beer> getAllBeers() {
        return beerRepository.findAll();
    }

    @Override
    public Beer addBeer(Beer beer) {
        return beerRepository.save(beer);
    }

    @Override
    public boolean removeBeer(String id) {
        UUID uuid = UUID.fromString(id);
        if (beerRepository.existsById(uuid)) {
            beerRepository.deleteById(uuid);
            return true;
        }
        return false;
    }
}
