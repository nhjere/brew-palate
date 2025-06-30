package com.codewithneal.brew_backend.brewer.CsvReader.breweries;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface BreweryCsvRepository extends JpaRepository<BreweryCsv, UUID> {
}