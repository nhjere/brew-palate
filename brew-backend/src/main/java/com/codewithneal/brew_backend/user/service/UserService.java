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
    public User registerUser(UserRegistrationDTO dto) {

        // checks if generated user_id already exists (prevents re registration for existing users)
        if (userRepo.existsById(dto.getUserId())) {
            throw new IllegalArgumentException("User already Exists ");
        }
        // checks if usname already exists
        if (userRepo.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("Username already taken.");
        }

        
        User user = new User(
            dto.getUserId(),
            dto.getUsername(),
            dto.getRole(),
            dto.getAddress()
        );

        return userRepo.save(user);
    }

    // returns the user associated with a user_id
    public Optional<User> getUserById(UUID userId) {
        return userRepo.findById(userId);
    }


    public boolean usernameExists(String username) {
        return userRepo.existsByUsername(username);
    }
}
