package com.codewithneal.brew_backend.user.service;

import com.codewithneal.brew_backend.user.model.UserBeer;

import java.util.List;

public interface UserBeerService {
    List<UserBeer> getAllBeers();
    UserBeer addBeer(UserBeer beer);
}


