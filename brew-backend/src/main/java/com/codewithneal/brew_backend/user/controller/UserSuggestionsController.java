package com.codewithneal.brew_backend.user.controller;

import com.codewithneal.brew_backend.user.dto.UserSuggestionDto;
import com.codewithneal.brew_backend.user.service.UserSuggestionService;

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
@RequestMapping("/api/user")
public class UserSuggestionsController {

    private final UserSuggestionService userSuggest;

    @Value("${supabase.jwt.secret}")
    private String jwtSecret;

    public UserSuggestionsController(UserSuggestionService userSuggest) {
        this.userSuggest = userSuggest;
    }

    /**
     * Returns a list of suggested users (potential friends) for the
     * currently authenticated user, based on their Supabase JWT.
     *
     * GET /api/user/suggestions?limit=6
     */
    @GetMapping("/suggestions")
    public ResponseEntity<?> getUserSuggestions(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "limit", defaultValue = "6") int limit
    ) {
        // 1. Extract bearer token
        String token = extractBearerToken(authHeader);
        if (token == null) {
            return ResponseEntity
                    .status(401)
                    .body(Map.of("error", "Missing or invalid Authorization header"));
        }

        // 2. Verify token and get userId (Supabase UUID in "sub")
        Optional<UUID> uidOpt = verifyAndGetUserId(token);
        if (uidOpt.isEmpty()) {
            return ResponseEntity
                    .status(401)
                    .body(Map.of("error", "Invalid token"));
        }

        UUID currentUserId = uidOpt.get();

        // 3. Fetch suggestions from the service layer
        try {
            List<UserSuggestionDto> suggestions = userSuggest.getSuggestions(currentUserId, limit);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            // Log if you have a logger, but keep response generic
            return ResponseEntity
                    .status(500)
                    .body(Map.of("error", "Failed to fetch user suggestions"));
        }
    }

    // ---------- Utility helpers (duplicated here to keep controllers separate) ----------

    private String extractBearerToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        return authHeader.substring("Bearer ".length());
    }

    private Optional<UUID> verifyAndGetUserId(String token) {
        try {
            DecodedJWT jwt = JWT
                    .require(Algorithm.HMAC256(jwtSecret))
                    .build()
                    .verify(token);

            String subject = jwt.getSubject(); // Supabase user UUID in "sub"
            return Optional.of(UUID.fromString(subject));
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
