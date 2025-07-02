package com.codewithneal.brew_backend.brewer.CsvReader.beers;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface BeerCsvRepository extends JpaRepository<BeerCsv, UUID> {
    @Query("SELECT b.flavorTags FROM BeerCsv b")
    List<List<String>> findAllFlavorTags();
}
