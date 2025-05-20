package com.codewithneal.brew_backend.brewer.service;

import com.codewithneal.brew_backend.brewer.model.Beer;

import java.util.List;


public interface BrewerBeerService {
    List<Beer> getAllBeers();
    Beer addBeer(Beer beer);
    boolean removeBeer(String id);
}