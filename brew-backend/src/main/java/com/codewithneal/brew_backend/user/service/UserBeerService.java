package com.codewithneal.brew_backend.user.service;

import java.util.List;
import org.springframework.stereotype.Service;

import com.codewithneal.brew_backend.user.model.UserBeer;

@Service
public class UserBeerService {
        public List<UserBeer> getBeers() {
        return List.of(
            new UserBeer(1L, "Hop Juice", "IPA", 1L),
            new UserBeer(2L, "Dark Matter", "Stout", 2L)
        );
    }
}
