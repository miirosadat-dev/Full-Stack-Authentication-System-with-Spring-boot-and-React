package com.sadat.auth.service;

import com.sadat.auth.repository.PasswordResetTokenRepository;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sadat.auth.dto.AuthResponse;
import com.sadat.auth.dto.ChangePasswordRequest;
import com.sadat.auth.dto.LoginRequest;
import com.sadat.auth.dto.LoginResponse;
import com.sadat.auth.dto.RefreshTokenRequest;
import com.sadat.auth.dto.RegisterRequest;
import com.sadat.auth.dto.ResetPasswordRequest;
import com.sadat.auth.dto.UserResponse;
import com.sadat.auth.dto.VerifyEmailRequest;
import com.sadat.auth.entity.OtpVerification;
import com.sadat.auth.entity.PasswordResetToken;
import com.sadat.auth.entity.User;
import com.sadat.auth.exception.DuplicateEmailException;
import com.sadat.auth.exception.EmailAlreadyVerifiedException;
import com.sadat.auth.exception.InvalidCredentialsException;
import com.sadat.auth.exception.InvalidOtpException;
import com.sadat.auth.exception.InvalidResetTokenException;
import com.sadat.auth.repository.UserRepository;
import com.sadat.auth.security.JwtService;

@Service
public class AuthService {

    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final OtpService otpService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final String frontendBaseUrl;
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final Duration LOCKOUT_DURATION = Duration.ofMinutes(15);
    private final RefreshTokenService refreshTokenService;
    private static final Duration RESET_TOKEN_VALIDITY = Duration.ofMinutes(30);

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            OtpService otpService,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            @Value("${app.frontend-url}") String frontendBaseUrl,
            RefreshTokenService refreshTokenService, PasswordResetTokenRepository passwordResetTokenRepository,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.frontendBaseUrl = frontendBaseUrl;
        this.refreshTokenService = refreshTokenService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(Instant.now())) {
            throw new InvalidCredentialsException("Account temporarily locked. Try again later.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (AuthenticationException ex) {
            throw new InvalidCredentialsException(registerFailedAttempt(user));
        }

        if (user.getFailedLoginAttempts() > 0 || user.getLockedUntil() != null) {
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
            userRepository.save(user);
        }

        String token = jwtService.generateToken(user);
        String refreshToken = refreshTokenService.createToken(user);
        return new LoginResponse(token, refreshToken, user.getId(), user.getEmail(), user.getFullName(),
                user.isEmailVerified());
    }

    public LoginResponse refresh(RefreshTokenRequest request) {
        RefreshTokenService.RotatedTokens rotated = refreshTokenService.validateAndRotate(request.refreshToken());
        User user = rotated.user();
        String newAccessToken = jwtService.generateToken(user);
        return new LoginResponse(newAccessToken, rotated.rawToken(), user.getId(), user.getEmail(), user.getFullName(),
                user.isEmailVerified());
    }

    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid request"));
        refreshTokenService.revokeAllForUser(user);
    }

    private String registerFailedAttempt(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);

        String message;
        if (attempts >= MAX_FAILED_ATTEMPTS) {
            user.setLockedUntil(Instant.now().plus(LOCKOUT_DURATION));
            message = "Account temporarily locked. Try again later.";
        } else {
            int remaining = MAX_FAILED_ATTEMPTS - attempts;
            message = "Invalid email or password. " + remaining + " attempt" + (remaining == 1 ? "" : "s")
                    + " remaining.";
        }

        userRepository.save(user);
        return message;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateEmailException("An account with this email already exists");
        }

        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .emailVerified(false)
                .build();

        User saved = userRepository.save(user);

        otpService.createAndSendOtp(saved, OtpVerification.Purpose.EMAIL_VERIFICATION);

        return new AuthResponse(saved.getId(), saved.getEmail(), saved.isEmailVerified(),
                "Registration successful. Please verify your email.");
    }

    public void resendVerification(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            if (!user.isEmailVerified()) {
                otpService.createAndSendOtp(user, OtpVerification.Purpose.EMAIL_VERIFICATION);
            }
        });
        // Deliberately no branch for "user not found" or "already verified" —
        // the caller gets an identical response either way. See controller.
    }

    public AuthResponse verifyEmail(VerifyEmailRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new InvalidOtpException("Invalid code or account"));

        if (user.isEmailVerified()) {
            throw new EmailAlreadyVerifiedException("This email is already verified. Please log in.");
        }

        otpService.verifyOtp(user, OtpVerification.Purpose.EMAIL_VERIFICATION, request.code());

        user.setEmailVerified(true);
        userRepository.save(user);

        return new AuthResponse(user.getId(), user.getEmail(), true, "Email verified successfully.");
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));
        return new UserResponse(user.getId(), user.getEmail(), user.getFullName(), user.isEmailVerified());
    }

    public void forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            String rawToken = UUID.randomUUID().toString() + UUID.randomUUID();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .user(user)
                    .tokenHash(hashToken(rawToken))
                    .expiresAt(Instant.now().plus(RESET_TOKEN_VALIDITY))
                    .used(false)
                    .build();
            passwordResetTokenRepository.save(resetToken);

            String resetLink = frontendBaseUrl + "/reset-password?token=" + rawToken;
            emailService.sendEmail(
                    user.getEmail(),
                    "Reset your Anchor password",
                    "Click here to reset your password: " + resetLink + "\nThis link expires in 30 minutes.");
        });
        // No else branch — same response whether the email exists or not
        // (enumeration-safe, same pattern as Phase 8's resend-verification)
    }

    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(hashToken(request.token()))
                .filter(t -> !t.isUsed())
                .filter(t -> t.getExpiresAt().isAfter(Instant.now()))
                .orElseThrow(() -> new InvalidResetTokenException(
                        "Invalid or expired reset link. Please request a new one."));

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        refreshTokenService.revokeAllForUser(user); // password changed — kill all existing sessions
    }

    private String hashToken(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid request"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        refreshTokenService.revokeAllForUser(user); // same reasoning as reset-password — force re-login everywhere
    }
}