package com.codewithneal.brew_backend.user.repository;

import com.codewithneal.brew_backend.user.model.SurveyBeer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SurveyBeerRepository extends JpaRepository<SurveyBeer, UUID> {
}
