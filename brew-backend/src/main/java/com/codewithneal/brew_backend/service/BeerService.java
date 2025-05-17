package com.codewithneal.brew_backend.service;
import java.util.List;
import org.springframework.stereotype.Service;
import com.codewithneal.brew_backend.model.Beer;

@Service
public class BeerService {
        public List<Beer> getBeers() {
        return List.of(
            new Beer(1L, "Hop Juice", "IPA", 1L),
            new Beer(2L, "Dark Matter", "Stout", 2L)
        );
    }
}
