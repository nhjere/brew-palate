package com.codewithneal.brew_backend.brewer.repository;

import com.codewithneal.brew_backend.brewer.model.Beer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface BeerRepository extends JpaRepository<Beer, UUID> {
    
    
}
