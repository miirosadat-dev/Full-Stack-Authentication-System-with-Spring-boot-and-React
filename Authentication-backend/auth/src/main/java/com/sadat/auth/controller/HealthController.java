package com.sadat.auth.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sadat.auth.dto.HealthResponse;
import com.sadat.auth.service.HealthService;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final HealthService healthService;

    // Constructor injection: Spring sees this constructor needs a HealthService,
    // finds the @Service bean it already created, and passes it in automatically.
    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    @GetMapping("/health")
    public HealthResponse health() {
        return healthService.getStatus();
    }

    @GetMapping("/health/boom")
    public HealthResponse boom() {
        // Deliberately broken endpoint, purely to prove GlobalExceptionHandler works.
        throw new RuntimeException("Deliberate test error");
    }
}
