package com.sadat.auth.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sadat.auth.dto.AuthResponse;
import com.sadat.auth.dto.RegisterRequest;
import com.sadat.auth.entity.User;
import com.sadat.auth.exception.DuplicateEmailException;
import com.sadat.auth.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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

        return new AuthResponse(saved.getId(), saved.getEmail(), saved.isEmailVerified(),
                "Registration successful. Please verify your email.");
    }
}