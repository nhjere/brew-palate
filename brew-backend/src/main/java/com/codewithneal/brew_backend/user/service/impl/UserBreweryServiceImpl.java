package com.codewithneal.brew_backend.user.service.impl;

import com.codewithneal.brew_backend.user.model.Brewery;
import com.codewithneal.brew_backend.user.repository.BreweryRepository;
import com.codewithneal.brew_backend.user.service.UserBreweryService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserBreweryServiceImpl implements UserBreweryService {

    private final BreweryRepository breweryRepository;

    public UserBreweryServiceImpl(BreweryRepository breweryRepository) {
        this.breweryRepository = breweryRepository;
    }

    @Override
    public List<Brewery> getAllBreweries() {
        return breweryRepository.findAll();
    }
}
