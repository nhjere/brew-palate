package com.codewithneal.brew_backend.user.service;

import com.codewithneal.brew_backend.user.dto.UserComparisonDTO;
import com.codewithneal.brew_backend.user.model.UserComparison;
import com.codewithneal.brew_backend.user.repository.UserComparisonRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ComparisonService {

    private final UserComparisonRepository comparisonRepo;

    public ComparisonService(UserComparisonRepository comparisonRepo) {
        this.comparisonRepo = comparisonRepo;
    }

    public UserComparison saveComparison(UUID userId, UserComparisonDTO dto) {
        UserComparison comparison = new UserComparison(
            userId,
            dto.getBeerAId(),
            dto.getBeerBId(),
            dto.getWinnerId(),
            dto.getContext()
        );
        return comparisonRepo.save(comparison);
    }

    public List<UserComparison> getComparisonsByUser(UUID userId) {
        return comparisonRepo.findByUserId(userId);
    }

    // looks for 8 or more comparisons to have been onboarded (# user id entries in user_comparisons table)
    public boolean hasCompletedOnboarding(UUID userId) {
        List<UserComparison> surveyComparisons = comparisonRepo.findByUserIdAndContext(userId, "survey");
        return surveyComparisons.size() >= 8;
    }
}
