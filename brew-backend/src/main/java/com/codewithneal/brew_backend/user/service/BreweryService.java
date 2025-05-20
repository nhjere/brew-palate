package com.codewithneal.brew_backend.user.service;

import com.codewithneal.brew_backend.user.model.Brewery;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BreweryService {

    private final List<Brewery> breweries = new ArrayList<>();

    public BreweryService() {
        breweries.add(new Brewery("1", "Lone Star Brewing Co.", "Austin, TX"));
        breweries.add(new Brewery("2", "Hilltop Brewing", "Denver, CO"));
        breweries.add(new Brewery("3", "Moonlight Brewery", "Portland, OR"));
    }

    public List<Brewery> getAllBreweries() {
        return breweries;
    }
}
