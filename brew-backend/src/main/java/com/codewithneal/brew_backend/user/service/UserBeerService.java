package com.codewithneal.brew_backend.user.service;

import com.codewithneal.brew_backend.user.model.UserBeer;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserBeerService {

    private final List<UserBeer> beers = new ArrayList<>();

    public UserBeerService() {
        beers.add(new UserBeer("1", "Sunset IPA", "IPA", "Lone Star Brewing Co.", "101"));
        beers.add(new UserBeer("2", "Autumn Lager", "Lager", "Hilltop Brewing", "102"));
        beers.add(new UserBeer("3", "Citrus Blonde", "Blonde Ale", "Moonlight Brewery", "103"));
    }

    public List<UserBeer> getAllBeers() {
        return beers;
    }
}
