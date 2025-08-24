package com.codewithneal.brew_backend;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class JwtService {
    @Value("${supabase.jwt.secret}")
    private String jwtSecret;

    public UUID requireUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
        throw new IllegalArgumentException("Missing or invalid Authorization header");
        String token = authHeader.substring(7);
        DecodedJWT jwt = JWT.require(Algorithm.HMAC256(jwtSecret))
                            .build()
                            .verify(token); 
        return UUID.fromString(jwt.getSubject());
    }
}
