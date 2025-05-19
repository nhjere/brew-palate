package com.codewithneal.brew_backend.user.service;
import java.util.List;
import org.springframework.stereotype.Service;

import com.codewithneal.brew_backend.user.model.Brewery;

@Service
public class BreweryService {
    public List<Brewery> getBreweries() {
        return List.of(
            new Brewery(1L, "Jester King", "Austin, TX"),
            new Brewery(2L, "B52 Brewing", "Conroe, TX")
        );
    }
}