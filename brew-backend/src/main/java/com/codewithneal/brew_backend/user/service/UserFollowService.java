package com.codewithneal.brew_backend.user.service;

import com.codewithneal.brew_backend.user.model.UserFollow;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserFollowService {
    private final List<UserFollow> follows = new ArrayList<>();

    public List<UserFollow> getFollowsByUser(String userId) {
        return follows.stream()
                .filter(f -> f.getUserId().equals(userId))
                .toList();
    }

    public UserFollow followBrewery(UserFollow follow) {
        follows.add(follow);
        return follow;
    }

    public boolean unfollowBrewery(String userId, String breweryId) {
        return follows.removeIf(f -> f.getUserId().equals(userId) && f.getBreweryId().equals(breweryId));
    }
}
