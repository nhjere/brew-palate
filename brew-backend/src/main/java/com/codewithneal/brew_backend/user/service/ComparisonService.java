package com.codewithneal.brew_backend.user.service;

import com.codewithneal.brew_backend.user.dto.UserComparisonDTO;
import com.codewithneal.brew_backend.user.dto.UserEloScoreDTO;
import com.codewithneal.brew_backend.user.model.UserComparison;
import com.codewithneal.brew_backend.user.model.UserEloScore;
import com.codewithneal.brew_backend.user.repository.UserComparisonRepository;
import com.codewithneal.brew_backend.user.repository.UserEloScoreRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ComparisonService {

    private final UserComparisonRepository comparisonRepo;
    private final UserEloScoreRepository eloRepo;

    public ComparisonService(UserComparisonRepository comparisonRepo, UserEloScoreRepository eloRepo) {
        this.comparisonRepo = comparisonRepo;
        this.eloRepo = eloRepo;
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

    public List<UserEloScore> getEloScoresByUser(UUID userId) {
        return eloRepo.findByUserId(userId);
    }

    public void updateEloScores(List<UserEloScoreDTO> scores) {
        for (UserEloScoreDTO dto : scores) {
            UserEloScore elo = eloRepo.findByUserIdAndBeerId(dto.getUserId(), dto.getBeerId())
                .orElse(new UserEloScore(dto.getUserId(), dto.getBeerId()));
            elo.setScore(dto.getScore());
            elo.setComparisonCount(dto.getComparisonCount());
            eloRepo.save(elo);
        }
    }
}
