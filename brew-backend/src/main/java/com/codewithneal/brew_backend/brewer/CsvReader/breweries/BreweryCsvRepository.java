package com.codewithneal.brew_backend.brewer.CsvReader.breweries;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.Optional;

public interface BreweryCsvRepository extends JpaRepository<BreweryCsv, UUID> {
    Optional<BreweryCsv> findByExternalBreweryId(String externalBreweryId);
}