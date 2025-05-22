package com.codewithneal.brew_backend.user.repository;

import com.codewithneal.brew_backend.user.model.Brewery;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BreweryRepository extends JpaRepository<Brewery, String> {
}
