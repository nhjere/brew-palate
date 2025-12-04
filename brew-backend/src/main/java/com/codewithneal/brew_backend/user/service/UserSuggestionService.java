package com.codewithneal.brew_backend.user.service;

import org.springframework.stereotype.Service;

import com.codewithneal.brew_backend.user.dto.UserSuggestionDto;
import com.codewithneal.brew_backend.user.model.User;
import com.codewithneal.brew_backend.user.repository.UserProfileRepository;

import java.util.List;
import java.util.UUID;

@Service
public class UserSuggestionService {

    private final UserProfileRepository userProfileRepository;

    public UserSuggestionService(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    public List<UserSuggestionDto> getSuggestions(UUID currentUserId, int limit) {
        List<User> users = userProfileRepository.findRandomSuggestions(currentUserId, limit);

        return users.stream()
                .map(u -> new UserSuggestionDto(
                        u.getUserId(),
                        u.getUsername(),   // or u.getUsername()
                        u.getAddress()
                ))
                .toList();
    }
}
