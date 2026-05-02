package com.codewithneal.brew_backend.user.controller;

import com.codewithneal.brew_backend.user.dto.UserComparisonDTO;
import com.codewithneal.brew_backend.user.dto.UserEloScoreDTO;
import com.codewithneal.brew_backend.user.dto.SurveyBeerDTO;
import com.codewithneal.brew_backend.user.model.UserComparison;
import com.codewithneal.brew_backend.user.model.UserEloScore;
import com.codewithneal.brew_backend.user.model.SurveyBeer;
import com.codewithneal.brew_backend.user.repository.SurveyBeerRepository;
import com.codewithneal.brew_backend.user.service.ComparisonService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ComparisonController {

    private final ComparisonService comparisonService;
    private final SurveyBeerRepository surveyBeerRepository;

    @Value("${supabase.jwt.secret}")
    private String jwtSecret;

    public ComparisonController(ComparisonService comparisonService, SurveyBeerRepository surveyBeerRepository) {
        this.comparisonService = comparisonService;
        this.surveyBeerRepository = surveyBeerRepository;
    }

    @PostMapping("/comparisons")
    public ResponseEntity<?> submitComparison(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @RequestBody UserComparisonDTO dto
    ) {
        Optional<UUID> uid = verifyAndGetUserId(authHeader);
        if (uid.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid Authorization header"));
        }

        UserComparison saved = comparisonService.saveComparison(uid.get(), dto);
        return ResponseEntity.status(201).body(saved);
    }

    @GetMapping("/comparisons/history")
    public ResponseEntity<?> getComparisonHistory(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Optional<UUID> uid = verifyAndGetUserId(authHeader);
        if (uid.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid Authorization header"));
        }

        List<UserComparison> comparisons = comparisonService.getComparisonsByUser(uid.get());
        return ResponseEntity.ok(comparisons);
    }

    @GetMapping("/user/onboarding-status")
    public ResponseEntity<?> getOnboardingStatus(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Optional<UUID> uid = verifyAndGetUserId(authHeader);
        if (uid.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid Authorization header"));
        }

        boolean completed = comparisonService.hasCompletedOnboarding(uid.get());
        return ResponseEntity.ok(Map.of(
            "onboardingCompleted", completed,
            "userId", uid.get()
        ));
    }

    @GetMapping("/elo/{userId}")
    public ResponseEntity<List<UserEloScoreDTO>> getEloScores(@PathVariable UUID userId) {
        List<UserEloScore> scores = comparisonService.getEloScoresByUser(userId);
        List<UserEloScoreDTO> dtos = scores.stream()
            .map(s -> new UserEloScoreDTO(s.getUserId(), s.getBeerId(), s.getScore(), s.getComparisonCount()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/elo")
    public ResponseEntity<?> updateEloScores(@RequestBody List<UserEloScoreDTO> scores) {
        comparisonService.updateEloScores(scores);
        return ResponseEntity.ok(Map.of("updated", scores.size()));
    }

    @GetMapping("/survey-beers")
    public ResponseEntity<List<SurveyBeerDTO>> getSurveyBeers() {
        List<SurveyBeer> beers = surveyBeerRepository.findAll();
        List<SurveyBeerDTO> dtos = beers.stream()
            .map(b -> new SurveyBeerDTO(
                b.getSurveyBeerId(), b.getName(), b.getStyle(), b.getStyleFamily(),
                b.getAbv(), b.getIbu(), b.getImageUrl(), b.getFlavorTags()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    private Optional<UUID> verifyAndGetUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return Optional.empty();
        try {
            String token = authHeader.substring("Bearer ".length());
            DecodedJWT jwt = JWT.require(Algorithm.HMAC256(jwtSecret)).build().verify(token);
            return Optional.of(UUID.fromString(jwt.getSubject()));
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
