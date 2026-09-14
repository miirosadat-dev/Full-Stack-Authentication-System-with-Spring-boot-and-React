package com.sadat.auth.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sadat.auth.dto.AuthResponse;
import com.sadat.auth.dto.RegisterRequest;
import com.sadat.auth.entity.OtpVerification;
import com.sadat.auth.entity.User;
import com.sadat.auth.exception.DuplicateEmailException;
import com.sadat.auth.repository.UserRepository;

@Service
public class AuthService {

    private final OtpService otpService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, OtpService otpService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
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
}