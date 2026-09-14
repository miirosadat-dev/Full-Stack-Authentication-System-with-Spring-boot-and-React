package com.sadat.auth.dto;

import java.util.UUID;

public record AuthResponse(UUID userId, String email, boolean emailVerified, String message) {
}