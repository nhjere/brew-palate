package com.codewithneal.brew_backend.user.controller;

import com.codewithneal.brew_backend.user.model.UserFollow;
import com.codewithneal.brew_backend.user.repository.UserFollowRepository;
import com.codewithneal.brew_backend.user.repository.BreweryRepository;
import com.codewithneal.brew_backend.user.model.Brewery;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;

@RestController
@RequestMapping("/api/user/follows")
public class UserFollowController {

    private final UserFollowRepository followRepo;
    private final BreweryRepository breweryRepo;

    public UserFollowController(UserFollowRepository followRepo, BreweryRepository breweryRepo) {
        this.followRepo = followRepo;
        this.breweryRepo = breweryRepo;
    }

    @PostMapping
    public ResponseEntity<?> followBrewery(@RequestParam String userId, @RequestParam String breweryId) {
        if (followRepo.existsByUserIdAndBrewery_Id(userId, breweryId)) {
            return ResponseEntity.status(409).body("Already following this brewery");
        }

        Brewery brewery = breweryRepo.findById(breweryId).orElse(null);
        if (brewery == null) {
            return ResponseEntity.badRequest().body("Brewery not found");
        }

        UserFollow follow = new UserFollow(userId, brewery);
        return ResponseEntity.ok(followRepo.save(follow));
    }

    @GetMapping("/{userId}")
    public List<Brewery> getFollowedBreweries(@PathVariable String userId) {
        return followRepo.findByUserId(userId).stream()
                .map(UserFollow::getBrewery)
                .toList();
    }

    @Transactional
    @DeleteMapping
    public ResponseEntity<?> unfollowBrewery(@RequestParam String userId, @RequestParam String breweryId) {
        if (!followRepo.existsByUserIdAndBrewery_Id(userId, breweryId)) {
            return ResponseEntity.notFound().build();
        }

        followRepo.deleteByUserIdAndBrewery_Id(userId, breweryId);
        return ResponseEntity.noContent().build();
    }
}
