package com.codewithneal.brew_backend.user.service;

import org.springframework.stereotype.Service;

import com.codewithneal.brew_backend.user.dto.FriendSuggestionDto;
import com.codewithneal.brew_backend.user.model.User;
import com.codewithneal.brew_backend.user.repository.FriendRepository;

import java.util.List;
import java.util.UUID;

@Service
public class FriendSuggestionService {

    private final FriendRepository userProfileRepository;

    public FriendSuggestionService(FriendRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    public List<FriendSuggestionDto> getSuggestions(UUID currentUserId, int limit) {
        List<User> users = userProfileRepository.findRandomSuggestions(currentUserId, limit);

        return users.stream()
                .map(u -> new FriendSuggestionDto(
                        u.getUserId(),
                        u.getUsername(),   // or u.getUsername()
                        u.getAddress()
                ))
                .toList();
    }
}
