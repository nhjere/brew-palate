package com.codewithneal.brew_backend.brewer.repository;

import com.codewithneal.brew_backend.brewer.CSVreader.BeerCsv;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BeerCsvRepository extends JpaRepository<BeerCsv, Long> {
}
