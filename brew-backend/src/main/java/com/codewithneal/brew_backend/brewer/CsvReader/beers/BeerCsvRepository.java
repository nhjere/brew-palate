package com.codewithneal.brew_backend.brewer.CsvReader.beers;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface BeerCsvRepository extends JpaRepository<BeerCsv, UUID> {
}
