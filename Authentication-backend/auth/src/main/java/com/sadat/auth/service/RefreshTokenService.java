package com.sadat.auth.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.sadat.auth.entity.RefreshToken;
import com.sadat.auth.entity.User;
import com.sadat.auth.repository.RefreshTokenRepository;

import jakarta.transaction.Transactional;

@Service
public class RefreshTokenService {

    private static final Duration REFRESH_TOKEN_VALIDITY = Duration.ofDays(7);
    private final RefreshTokenRepository repository;

    public RefreshTokenService(RefreshTokenRepository repository) {
        this.repository = repository;
    }

    public String createToken(User user) {
        String rawToken = UUID.randomUUID().toString() + UUID.randomUUID();
        RefreshToken token = RefreshToken.builder()
                .user(user)
                .tokenHash(hash(rawToken))
                .expiresAt(Instant.now().plus(REFRESH_TOKEN_VALIDITY))
                .revoked(false)
                .build();
        repository.save(token);
        return rawToken;
    }

    @Transactional
    public RotatedTokens validateAndRotate(String rawToken) {
        RefreshToken existing = repository.findByTokenHash(hash(rawToken))
                .filter(t -> !t.isRevoked())
                .filter(t -> t.getExpiresAt().isAfter(Instant.now()))
                .orElseThrow(() -> new InvalidRefreshTokenException("Invalid or expired refresh token"));

        existing.setRevoked(true);
        repository.save(existing);

        String newRawToken = createToken(existing.getUser());
        return new RotatedTokens(existing.getUser(), newRawToken);
    }

    public void revokeAllForUser(User user) {
        repository.findAll().stream()
                .filter(t -> t.getUser().getId().equals(user.getId()) && !t.isRevoked())
                .forEach(t -> {
                    t.setRevoked(true);
                    repository.save(t);
                });
    }

    private String hash(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    public record RotatedTokens(User user, String rawToken) {
    }
}