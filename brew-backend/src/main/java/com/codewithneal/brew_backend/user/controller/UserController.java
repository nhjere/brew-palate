package com.codewithneal.brew_backend.user.controller;

import com.codewithneal.brew_backend.user.dto.UserRegistrationDTO;
import com.codewithneal.brew_backend.user.model.User;
import com.codewithneal.brew_backend.user.service.UserService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import java.util.Optional;


@RestController
@RequestMapping("/api/user")

public class UserController {

    private final UserService userService; 

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/username/{userId}")
    public ResponseEntity<?> getUsername(@PathVariable UUID userId) {
        return userService.getUserById(userId)
            .map(user -> ResponseEntity.ok(Map.of("username", user.getUsername())))
            .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "User not found")));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationDTO userDTO) {
        try {
            // returns 201 created with saved user
            User savedUser = userService.registerUser(userDTO);
            return ResponseEntity.status(201).body(savedUser);
        } catch (IllegalArgumentException e) {
            // validation users (ie duplicate user)
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            // catches any other error
            return ResponseEntity.internalServerError().body("Registration failed");
        }
    }

    // checks if username exists in db
    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        boolean exists = userService.usernameExists(username);
        return ResponseEntity.ok(Map.of("available", !exists));
    }

    // retrieve a  profile information based on a JWT (JSON Web Token) provided in the HTTP Authorization header
    @Value("${supabase.jwt.secret}")
        private String jwtSecret;

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");

        try {
            // Decode Supabase JWT token
            DecodedJWT jwt = JWT.require(Algorithm.HMAC256(jwtSecret))
                                .build()
                                .verify(token);
            String userId = jwt.getSubject(); // Supabase UID is in "sub"

            // Fetch from DB using userId
            Optional<User> userOpt = userService.getUserById(UUID.fromString(userId));
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "address", user.getAddress()
                // add anything else
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }
    }

    @PatchMapping("/profile/update")
    public ResponseEntity<?> updateUserProfile(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody Map<String, Object> updates
    ) {
        // remove bearer prefix from authorization header
        String token = authHeader.replace("Bearer ", "");
        try {
            // Decode Supabase JWT token
            DecodedJWT jwt = JWT.require(Algorithm.HMAC256(jwtSecret))
                                .build()
                                .verify(token);
            String userId = jwt.getSubject();

            Optional<User> userOpt = userService.getUserById(UUID.fromString(userId));
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            User updatedUser = userOpt.get();

            // conditionally update user fields
            if (updates.containsKey("username")) {
                updatedUser.setUsername((String) updates.get("username"));
            }
            if (updates.containsKey("address")) {
                updatedUser.setAddress((String) updates.get("address"));
            }

            userService.saveUser(updatedUser);

            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token or update failed"));
        }
    }
 


}
