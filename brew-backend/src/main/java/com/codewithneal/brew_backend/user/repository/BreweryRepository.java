package com.codewithneal.brew_backend.user.repository;

import com.codewithneal.brew_backend.user.model.Brewery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BreweryRepository extends JpaRepository<Brewery, UUID> {
}
