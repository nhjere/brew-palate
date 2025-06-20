package com.codewithneal.brew_backend.user.repository;

import com.codewithneal.brew_backend.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    boolean existsByUsername(String username);
}
