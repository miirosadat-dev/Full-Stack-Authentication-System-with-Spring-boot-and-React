package com.sadat.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sadat.auth.entity.OtpVerification;
import com.sadat.auth.entity.User;

import java.util.Optional;
import java.util.UUID;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, UUID> {

    Optional<OtpVerification> findTopByUserAndPurposeOrderByCreatedAtDesc(User user, OtpVerification.Purpose purpose);
}
