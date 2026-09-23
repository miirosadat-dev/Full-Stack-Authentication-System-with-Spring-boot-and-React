package com.sadat.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final RestClient restClient;
    private final String fromAddress;

    public EmailService(@Value("${resend.api-key}") String apiKey,
            @Value("${resend.from-address}") String fromAddress) {
        this.fromAddress = fromAddress;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.resend.com")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            restClient.post()
                    .uri("/emails")
                    .body(Map.of(
                            "from", fromAddress,
                            "to", to,
                            "subject", subject,
                            "text", body))
                    .retrieve()
                    .toBodilessEntity();
            log.info("Email sent successfully to {}", to);
        } catch (Exception ex) {
            log.error("Failed to send email to {}: {}", to, ex.getMessage(), ex);
        }
    }
}