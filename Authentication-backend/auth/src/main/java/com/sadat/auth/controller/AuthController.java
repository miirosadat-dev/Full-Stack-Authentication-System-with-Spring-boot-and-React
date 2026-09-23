package com.sadat.auth.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sadat.auth.dto.AuthResponse;
import com.sadat.auth.dto.ChangeEmailRequest;
import com.sadat.auth.dto.ChangePasswordRequest;
import com.sadat.auth.dto.ConfirmEmailChangeRequest;
import com.sadat.auth.dto.ForgotPasswordRequest;
import com.sadat.auth.dto.LoginRequest;
import com.sadat.auth.dto.LoginResponse;
import com.sadat.auth.dto.RefreshTokenRequest;
import com.sadat.auth.dto.RegisterRequest;
import com.sadat.auth.dto.ResendVerificationRequest;
import com.sadat.auth.dto.ResetPasswordRequest;
import com.sadat.auth.dto.UserResponse;
import com.sadat.auth.dto.VerifyEmailRequest;
import com.sadat.auth.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        authService.resendVerification(request.email());
        return ResponseEntity.ok("If an account with that email exists, a verification code has been sent.");
    }

    @PostMapping("/verify-email")
    public ResponseEntity<LoginResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        LoginResponse response = authService.verifyEmail(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        UserResponse response = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication) {
        authService.logout(authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.email());
        return ResponseEntity.ok("If an account with that email exists, a reset link has been sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Password reset successfully. Please log in.");
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        authService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok("Password changed successfully.");
    }

    @PostMapping("/change-email/request")
    public ResponseEntity<String> requestEmailChange(@Valid @RequestBody ChangeEmailRequest request,
            Authentication authentication) {
        authService.requestEmailChange(authentication.getName(), request);
        return ResponseEntity.ok("Verification code sent to your new email address.");
    }

    @PostMapping("/change-email/confirm")
    public ResponseEntity<String> confirmEmailChange(@Valid @RequestBody ConfirmEmailChangeRequest request,
            Authentication authentication) {
        authService.confirmEmailChange(authentication.getName(), request);
        return ResponseEntity.ok("Email updated successfully.");
    }
}
