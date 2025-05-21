package com.codewithneal.brew_backend.user.service;

import com.codewithneal.brew_backend.user.model.UserFollow;
import java.util.List;

public interface UserFollowService {
    List<UserFollow> getFollowsByUser(String userId);
    UserFollow followBrewery(UserFollow follow);
    boolean unfollowBrewery(String userId, String breweryId);
}
