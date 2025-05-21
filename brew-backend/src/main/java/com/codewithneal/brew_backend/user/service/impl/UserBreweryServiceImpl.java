package com.codewithneal.brew_backend.user.service.impl;

import com.codewithneal.brew_backend.user.model.UserBrewery;
import com.codewithneal.brew_backend.user.service.UserBreweryService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserBreweryServiceImpl implements UserBreweryService {

    private final List<UserBrewery> breweries = new ArrayList<>();

    public UserBreweryServiceImpl() {
        breweries.add(new UserBrewery("1", "Lone Star Brewing Co.", "Austin, TX"));
        breweries.add(new UserBrewery("2", "Hilltop Brewing", "Denver, CO"));
        breweries.add(new UserBrewery("3", "Moonlight Brewery", "Portland, OR"));
    }

    @Override
    public List<UserBrewery> getAllBreweries() {
        return breweries;
    }
}
