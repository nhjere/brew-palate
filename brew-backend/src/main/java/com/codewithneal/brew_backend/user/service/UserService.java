package com.codewithneal.brew_backend.user.service;

import com.codewithneal.brew_backend.user.dto.UserRegistrationDTO;
import com.codewithneal.brew_backend.user.model.User;
import com.codewithneal.brew_backend.user.repository.UserRepository;

import java.util.UUID;
import java.util.Optional;

import org.springframework.stereotype.Service;

// maybe will add an interfaced implementation like other service classes
@Service
public class UserService {

    private final UserRepository userRepo;

    public UserService(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    
    // copies dto sent from front end to actual user stored in back end
    // UserService.java
    public User registerUser(UserRegistrationDTO dto) {
        // Convert DTO userId (String) -> UUID
        UUID userId = dto.getUserId();  // <- if DTO is String

        // validations
        if (userRepo.existsById(userId)) {
            throw new IllegalArgumentException("User already Exists");
        }
        if (userRepo.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("Username already taken.");
        }

        // build entity via setters (no constructor needed)
        User user = new User();
        user.setUserId(userId);
        user.setUsername(dto.getUsername());
        user.setRole(dto.getRole());
        user.setAddress(dto.getAddress());
        // If you added new columns (e.g., hasBrewery/breweryId), leave defaults or set here

        return userRepo.save(user);
    }


    // returns the user associated with a user_id
    public Optional<User> getUserById(UUID userId) {
        return userRepo.findById(userId);
    }

    // saves user changes
    public User saveUser(User user) {
        return userRepo.save(user);
    }

    // returns a user by username
    public Optional<User> getUserByUsername(String username) {
        return userRepo.findByUsername(username);
    }

    public boolean usernameExists(String username) {
        return userRepo.existsByUsername(username);
    }
}
