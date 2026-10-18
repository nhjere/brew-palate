package com.codewithneal.brew_backend;

import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.JwkProviderBuilder;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.MalformedURLException;
import java.net.URI;
import java.security.interfaces.ECPublicKey;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Verifies Supabase access tokens.
 *
 * ES256 tokens (Supabase JWT signing keys) are checked against the project's
 * public JWKS. HS256 tokens (legacy shared secret) are accepted only while
 * SUPABASE_JWT_SECRET is set; unset it once the legacy secret is revoked.
 */
@Component
public class JwtService {
    private final JwkProvider jwkProvider;
    private final Algorithm legacyAlgorithm;

    public JwtService(@Value("${supabase.url}") String supabaseUrl,
                      @Value("${supabase.jwt.secret:}") String legacySecret) throws MalformedURLException {
        this.jwkProvider = new JwkProviderBuilder(URI.create(supabaseUrl + "/auth/v1/.well-known/jwks.json").toURL())
                .cached(10, 24, TimeUnit.HOURS)
                .rateLimited(10, 1, TimeUnit.MINUTES)
                .build();
        this.legacyAlgorithm = legacySecret.isBlank() ? null : Algorithm.HMAC256(legacySecret);
    }

    /** Verifies the token's signature and expiry; throws if invalid. */
    public DecodedJWT verify(String token) {
        DecodedJWT unverified = JWT.decode(token);
        Algorithm algorithm = switch (unverified.getAlgorithm()) {
            case "ES256" -> {
                try {
                    ECPublicKey key = (ECPublicKey) jwkProvider.get(unverified.getKeyId()).getPublicKey();
                    yield Algorithm.ECDSA256(key, null);
                } catch (Exception e) {
                    throw new JWTVerificationException("Unknown signing key", e);
                }
            }
            case "HS256" -> {
                if (legacyAlgorithm == null) throw new JWTVerificationException("Legacy HS256 tokens are disabled");
                yield legacyAlgorithm;
            }
            default -> throw new JWTVerificationException("Unsupported algorithm: " + unverified.getAlgorithm());
        };
        return JWT.require(algorithm).build().verify(token);
    }

    public UUID requireUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
        throw new IllegalArgumentException("Missing or invalid Authorization header");
        return UUID.fromString(verify(authHeader.substring(7)).getSubject());
    }
}
