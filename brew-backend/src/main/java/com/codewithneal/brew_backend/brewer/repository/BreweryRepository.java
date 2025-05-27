package com.codewithneal.brew_backend.brewer.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.codewithneal.brew_backend.brewer.model.Brewery;

import java.util.UUID;

public interface BreweryRepository extends JpaRepository<Brewery, UUID> {
}
