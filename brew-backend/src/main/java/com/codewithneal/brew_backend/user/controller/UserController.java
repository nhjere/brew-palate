package com.codewithneal.brew_backend.user.controller;

import com.codewithneal.brew_backend.user.dto.UserRegistrationDTO;
import com.codewithneal.brew_backend.user.model.User;
import com.codewithneal.brew_backend.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

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


}
