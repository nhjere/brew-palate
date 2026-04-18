package com.codewithneal.brew_backend.user.controller;

import com.codewithneal.brew_backend.user.dto.UserComparisonDTO;
import com.codewithneal.brew_backend.user.model.UserComparison;
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

@RestController
@RequestMapping("/api")
public class ComparisonController {

    private final ComparisonService comparisonService;

    @Value("${supabase.jwt.secret}")
    private String jwtSecret;

    public ComparisonController(ComparisonService comparisonService) {
        this.comparisonService = comparisonService;
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
