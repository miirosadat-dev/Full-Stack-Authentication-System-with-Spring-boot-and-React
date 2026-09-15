package com.sadat.auth.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sadat.auth.entity.OtpVerification;
import com.sadat.auth.entity.User;
import com.sadat.auth.exception.InvalidOtpException;
import com.sadat.auth.exception.OtpCooldownException;
import com.sadat.auth.exception.OtpExpiredException;
import com.sadat.auth.exception.TooManyOtpAttemptsException;
import com.sadat.auth.repository.OtpVerificationRepository;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
public class OtpService {

    private static final Duration RESEND_COOLDOWN = Duration.ofSeconds(60);
    private static final SecureRandom secureRandom = new SecureRandom();

    private static final int MAX_ATTEMPTS = 5;

    private final OtpVerificationRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public OtpService(OtpVerificationRepository otpRepository, PasswordEncoder passwordEncoder,
            EmailService emailService) {
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public void createAndSendOtp(User user, OtpVerification.Purpose purpose) {
        Optional<OtpVerification> latest = otpRepository.findTopByUserAndPurposeOrderByCreatedAtDesc(user, purpose);

        if (latest.isPresent()) {
            Instant cooldownEnd = latest.get().getCreatedAt().plus(RESEND_COOLDOWN);
            if (Instant.now().isBefore(cooldownEnd)) {
                long secondsLeft = Duration.between(Instant.now(), cooldownEnd).getSeconds();
                throw new OtpCooldownException(
                        "Please wait " + secondsLeft + " seconds before requesting another code");
            }
        }

        String rawCode = generateNumericCode();

        OtpVerification otp = OtpVerification.builder()
                .user(user)
                .otpCodeHash(passwordEncoder.encode(rawCode))
                .purpose(purpose)
                .expiresAt(Instant.now().plus(10, ChronoUnit.MINUTES))
                .consumed(false)
                .attemptCount(0)
                .build();

        otpRepository.save(otp);

        emailService.sendEmail(
                user.getEmail(),
                "Verify your Anchor account",
                "Your verification code is: " + rawCode + "\nThis code expires in 10 minutes.");
    }

    private String generateNumericCode() {
        int code = 100000 + secureRandom.nextInt(900000); // always 6 digits, 100000–999999
        return String.valueOf(code);
    }

    public void verifyOtp(User user, OtpVerification.Purpose purpose, String submittedCode) {
        OtpVerification otp = otpRepository.findTopByUserAndPurposeOrderByCreatedAtDesc(user, purpose)
                .filter(o -> !o.isConsumed())
                .orElseThrow(
                        () -> new InvalidOtpException("No active verification code found. Please request a new one."));

        if (otp.getAttemptCount() >= MAX_ATTEMPTS) {
            throw new TooManyOtpAttemptsException("Too many incorrect attempts. Please request a new code.");
        }

        if (Instant.now().isAfter(otp.getExpiresAt())) {
            otp.setConsumed(true);
            otpRepository.save(otp);
            throw new OtpExpiredException("This code has expired. Please request a new one.");
        }

        if (!passwordEncoder.matches(submittedCode, otp.getOtpCodeHash())) {
            otp.setAttemptCount(otp.getAttemptCount() + 1);
            otpRepository.save(otp);
            throw new InvalidOtpException("Incorrect code. Please try again.");
        }

        otp.setConsumed(true);
        otpRepository.save(otp);
    }
}