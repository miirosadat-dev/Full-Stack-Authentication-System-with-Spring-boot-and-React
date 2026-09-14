package com.sadat.auth.service;

import org.springframework.stereotype.Service;
import com.sadat.auth.dto.HealthResponse;

@Service
public class HealthService {

    public HealthResponse getStatus() {
        return new HealthResponse("UP", "auth-backend");
    }
}