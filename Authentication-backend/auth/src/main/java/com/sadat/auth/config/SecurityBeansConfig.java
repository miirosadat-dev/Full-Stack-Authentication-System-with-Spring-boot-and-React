package com.sadat.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityBeansConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Work factor 12 instead of the default 10: each increment roughly doubles
        // hashing time. 12 is a common production baseline — a deliberate cost
        // for attackers, while still comfortably fast for a real login request.
        return new BCryptPasswordEncoder(12);
    }
}
