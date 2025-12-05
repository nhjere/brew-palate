package com.codewithneal.brew_backend.user.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.codewithneal.brew_backend.user.model.User;

public interface FriendRepository extends JpaRepository<User, UUID> {

    @Query(
        value = """
            SELECT * FROM user_profiles 
            WHERE user_id <> :currentUserId 
            AND role <> 'brewer'
            ORDER BY RANDOM()
            LIMIT :limit
        """,
        nativeQuery = true
    )
    List<User> findRandomSuggestions(
        @Param("currentUserId") UUID currentUserId,
        @Param("limit") int limit
    );
}
