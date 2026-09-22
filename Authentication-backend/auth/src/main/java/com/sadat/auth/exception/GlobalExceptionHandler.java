package com.sadat.auth.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(DuplicateEmailException.class)
        public ResponseEntity<ApiError> handleDuplicateEmail(
                        DuplicateEmailException ex,
                        HttpServletRequest request) {

                return buildError(
                                HttpStatus.CONFLICT,
                                ex.getMessage(),
                                request);
        }

        @ExceptionHandler(OtpCooldownException.class)
        public ResponseEntity<ApiError> handleOtpCooldown(
                        OtpCooldownException ex,
                        HttpServletRequest request) {

                return buildError(
                                HttpStatus.TOO_MANY_REQUESTS,
                                ex.getMessage(),
                                request);
        }

        @ExceptionHandler(InvalidOtpException.class)
        public ResponseEntity<ApiError> handleInvalidOtp(
                        InvalidOtpException ex,
                        HttpServletRequest request) {

                return buildError(
                                HttpStatus.BAD_REQUEST,
                                ex.getMessage(),
                                request);
        }

        @ExceptionHandler(OtpExpiredException.class)
        public ResponseEntity<ApiError> handleOtpExpired(
                        OtpExpiredException ex,
                        HttpServletRequest request) {

                return buildError(
                                HttpStatus.BAD_REQUEST,
                                ex.getMessage(),
                                request);
        }

        @ExceptionHandler(EmailAlreadyVerifiedException.class)
        public ResponseEntity<ApiError> handleAlreadyVerified(
                        EmailAlreadyVerifiedException ex,
                        HttpServletRequest request) {

                return buildError(
                                HttpStatus.CONFLICT,
                                ex.getMessage(),
                                request);
        }

        @ExceptionHandler(TooManyOtpAttemptsException.class)
        public ResponseEntity<ApiError> handleTooManyAttempts(
                        TooManyOtpAttemptsException ex,
                        HttpServletRequest request) {

                return buildError(
                                HttpStatus.TOO_MANY_REQUESTS,
                                ex.getMessage(),
                                request);
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiError> handleValidation(
                        MethodArgumentNotValidException ex,
                        HttpServletRequest request) {

                String message = ex.getBindingResult()
                                .getFieldErrors()
                                .stream()
                                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                                .collect(Collectors.joining("; "));

                return buildError(
                                HttpStatus.BAD_REQUEST,
                                message,
                                request);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiError> handleUnexpected(
                        Exception ex,
                        HttpServletRequest request) {

                return buildError(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                ex.getMessage(),
                                request);
        }

        @ExceptionHandler(InvalidCredentialsException.class)
        public ResponseEntity<ApiError> handleInvalidCredentials(InvalidCredentialsException ex,
                        HttpServletRequest request) {
                return buildError(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
        }

        @ExceptionHandler(InvalidRefreshTokenException.class)
        public ResponseEntity<ApiError> handleInvalidRefreshToken(
                        InvalidRefreshTokenException ex,
                        HttpServletRequest request) {

                return buildError(
                                HttpStatus.UNAUTHORIZED,
                                ex.getMessage(),
                                request);
        }

        private ResponseEntity<ApiError> buildError(
                        HttpStatus status,
                        String message,
                        HttpServletRequest request) {

                ApiError error = new ApiError(
                                Instant.now(),
                                status.value(),
                                status.getReasonPhrase(),
                                message,
                                request.getRequestURI());

                return ResponseEntity.status(status).body(error);
        }
}