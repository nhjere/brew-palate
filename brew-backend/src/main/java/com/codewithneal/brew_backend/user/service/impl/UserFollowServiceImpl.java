package com.codewithneal.brew_backend.user.service.impl;

import com.codewithneal.brew_backend.user.model.UserFollow;
import com.codewithneal.brew_backend.user.service.UserFollowService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserFollowServiceImpl implements UserFollowService {

    private final List<UserFollow> follows = new ArrayList<>();

    @Override
    public List<UserFollow> getFollowsByUser(String userId) {
        return follows.stream()
                .filter(f -> f.getUserId().equals(userId))
                .toList();
    }

    @Override
    public UserFollow followBrewery(UserFollow follow) {
        follows.add(follow);
        return follow;
    }

    @Override
    public boolean unfollowBrewery(String userId, String breweryId) {
        return follows.removeIf(f -> f.getUserId().equals(userId) && f.getBreweryId().equals(breweryId));
    }
}
