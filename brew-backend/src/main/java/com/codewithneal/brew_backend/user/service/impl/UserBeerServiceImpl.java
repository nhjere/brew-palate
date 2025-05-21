package com.codewithneal.brew_backend.user.service.impl;

import com.codewithneal.brew_backend.user.model.UserBeer;
import com.codewithneal.brew_backend.user.service.UserBeerService;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.ArrayList;

@Service
public class UserBeerServiceImpl implements UserBeerService {

    private final List<UserBeer> beers = new ArrayList<>();

    @Override
    public List<UserBeer> getAllBeers() {
        return beers;
    }

    @Override
    public UserBeer addBeer(UserBeer beer) {
        beer.setId(UUID.randomUUID().toString());
        beers.add(beer);
        return beer;
    }

}
