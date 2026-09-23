package com.sadat.auth;

import com.sadat.auth.dto.LoginRequest;
import com.sadat.auth.dto.LoginResponse;
import com.sadat.auth.dto.RegisterRequest;
import com.sadat.auth.entity.User;
import com.sadat.auth.exception.DuplicateEmailException;
import com.sadat.auth.exception.InvalidCredentialsException;
import com.sadat.auth.repository.PasswordResetTokenRepository;
import com.sadat.auth.repository.UserRepository;
import com.sadat.auth.security.JwtService;
import com.sadat.auth.service.AuthService;
import com.sadat.auth.service.EmailService;
import com.sadat.auth.service.OtpService;
import com.sadat.auth.service.RefreshTokenService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private OtpService otpService;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtService jwtService;
    @Mock
    private RefreshTokenService refreshTokenService;
    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock
    private EmailService emailService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository, passwordEncoder, otpService, authenticationManager,
                jwtService, "http://localhost:5173", refreshTokenService,
                passwordResetTokenRepository, emailService);
    }

    private User buildUser() {
        return User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .fullName("Test User")
                .passwordHash("hashed")
                .emailVerified(true)
                .failedLoginAttempts(0)
                .build();
    }

    // --- register() ---

    @Test
    void register_throwsWhenEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest("Test User", "test@example.com", "Passw0rd!");
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateEmailException.class);

        verify(userRepository, never()).save(any());
        verify(otpService, never()).createAndSendOtp(any(), any());
    }

    // --- login() ---

    @Test
    void login_throwsGenericMessageWhenEmailDoesNotExist() {
        LoginRequest request = new LoginRequest("ghost@example.com", "whatever");
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Invalid email or password");
    }

    @Test
    void login_wrongPassword_incrementsAttemptsAndShowsRemainingCount() {
        User user = buildUser();
        LoginRequest request = new LoginRequest(user.getEmail(), "wrongpassword");

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("bad credentials"));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Invalid email or password. 4 attempts remaining.");

        assertThat(user.getFailedLoginAttempts()).isEqualTo(1);
        verify(userRepository).save(user);
    }

    @Test
    void login_fifthFailedAttempt_locksAccount() {
        User user = buildUser();
        user.setFailedLoginAttempts(4); // one more failure will hit MAX_FAILED_ATTEMPTS = 5
        LoginRequest request = new LoginRequest(user.getEmail(), "wrongpassword");

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("bad credentials"));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Account temporarily locked. Try again later.");

        assertThat(user.getLockedUntil()).isAfter(Instant.now());
    }

    @Test
    void login_blocksAttemptWhileAccountIsLocked_evenWithCorrectPassword() {
        User user = buildUser();
        user.setLockedUntil(Instant.now().plusSeconds(600)); // locked 10 min from now
        LoginRequest request = new LoginRequest(user.getEmail(), "correctpassword");

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Account temporarily locked. Try again later.");

        // authenticationManager should never even be called — locked out before
        // password is checked
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    void login_success_resetsFailedAttemptsAndReturnsTokens() {
        User user = buildUser();
        user.setFailedLoginAttempts(2); // had some prior failures
        LoginRequest request = new LoginRequest(user.getEmail(), "correctpassword");

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("fake-jwt");
        when(refreshTokenService.createToken(user)).thenReturn("fake-refresh-token");

        LoginResponse response = authService.login(request);

        assertThat(response.token()).isEqualTo("fake-jwt");
        assertThat(response.refreshToken()).isEqualTo("fake-refresh-token");
        assertThat(user.getFailedLoginAttempts()).isZero();
        assertThat(user.getLockedUntil()).isNull();
    }
}
