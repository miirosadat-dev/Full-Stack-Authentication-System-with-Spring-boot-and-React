package com.sadat.auth.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sadat.auth.dto.AuthResponse;
import com.sadat.auth.dto.LoginRequest;
import com.sadat.auth.dto.LoginResponse;
import com.sadat.auth.dto.RegisterRequest;
import com.sadat.auth.dto.VerifyEmailRequest;
import com.sadat.auth.entity.OtpVerification;
import com.sadat.auth.entity.User;
import com.sadat.auth.exception.DuplicateEmailException;
import com.sadat.auth.exception.EmailAlreadyVerifiedException;
import com.sadat.auth.exception.InvalidCredentialsException;
import com.sadat.auth.exception.InvalidOtpException;
import com.sadat.auth.repository.UserRepository;
import com.sadat.auth.security.JwtService;

@Service
public class AuthService {

    private final OtpService otpService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            OtpService otpService,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (AuthenticationException ex) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        String token = jwtService.generateToken(user);

        return new LoginResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.isEmailVerified());
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
}