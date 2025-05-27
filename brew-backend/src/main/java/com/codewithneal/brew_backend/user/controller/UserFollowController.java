package com.codewithneal.brew_backend.user.controller;

import com.codewithneal.brew_backend.brewer.model.Brewery;
import com.codewithneal.brew_backend.brewer.repository.BreweryRepository;
import com.codewithneal.brew_backend.user.model.UserFollow;
import com.codewithneal.brew_backend.user.repository.UserFollowRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

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
    public ResponseEntity<?> followBrewery(@RequestParam UUID userId, @RequestParam UUID breweryId) {
        if (followRepo.existsByUserIdAndBrewery_BreweryId(userId, breweryId)) {
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
    public List<Brewery> getFollowedBreweries(@PathVariable UUID userId) {
        return followRepo.findByUserId(userId).stream()
                .map(UserFollow::getBrewery)
                .toList();
    }

    @Transactional
    @DeleteMapping
    public ResponseEntity<?> unfollowBrewery(@RequestParam UUID userId, @RequestParam UUID breweryId) {
        if (!followRepo.existsByUserIdAndBrewery_BreweryId(userId, breweryId)) {
            return ResponseEntity.notFound().build();
        }

        followRepo.deleteByUserIdAndBrewery_BreweryId(userId, breweryId);
        return ResponseEntity.noContent().build();
    }
}
