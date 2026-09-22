package com.sadat.auth.dto;

import java.util.UUID;

public record LoginResponse(String token, String refreshToken, UUID userId, String email, String fullName,
        boolean emailVerified) {
}
