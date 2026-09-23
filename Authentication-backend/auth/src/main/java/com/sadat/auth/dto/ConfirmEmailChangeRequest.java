package com.sadat.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record ConfirmEmailChangeRequest(@NotBlank(message = "Code is required") String code) {
}
