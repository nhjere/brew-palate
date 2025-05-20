package com.codewithneal.brew_backend.user.controller;

import com.codewithneal.brew_backend.user.model.UserFollow;
import com.codewithneal.brew_backend.user.service.UserFollowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/follows")
public class UserFollowController {
    
    private final UserFollowService followService;

    public UserFollowController(UserFollowService followService) {
        this.followService = followService;
    }

    @GetMapping("/{userId}")
    public List<UserFollow> getFollowsByUser(@PathVariable String userId) {
        return followService.getFollowsByUser(userId);
    }

    @PostMapping
    public ResponseEntity<UserFollow> followBrewery(@RequestBody UserFollow follow) {
        return ResponseEntity.ok(followService.followBrewery(follow));
    }

    @DeleteMapping ResponseEntity<UserFollow> unfollowBrewery(@RequestParam String userId, @RequestParam String breweryId) {
        boolean removed = followService.unfollowBrewery(userId, breweryId);
        if (removed) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    } 


}
