package com.codewithneal.brew_backend.user.controller;

import com.codewithneal.brew_backend.brewer.repository.BeerRepository;
import com.codewithneal.brew_backend.user.dto.UserBeerDTO;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user/beers")
public class UserBeerController {

    private final BeerRepository beerRepository;

    public UserBeerController(BeerRepository beerRepository) {
        this.beerRepository = beerRepository;
    }

    @GetMapping
    public List<UserBeerDTO> getAllBeers() {
        return beerRepository.findAll().stream()
            .map(beer -> new UserBeerDTO(
                beer.getId(),
                beer.getName(),
                beer.getStyle(),
                beer.getBreweryId(),
                beer.getBreweryName()
            ))
            .collect(Collectors.toList());
    }
}
