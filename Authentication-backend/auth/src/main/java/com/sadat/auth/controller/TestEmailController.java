package com.sadat.auth.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sadat.auth.service.EmailService;

@RestController
@RequestMapping("/api/test")
public class TestEmailController {

    private final EmailService emailService;

    public TestEmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/send-email")
    public String sendTestEmail(@RequestParam String to) {
        emailService.sendEmail(to, "Anchor - Test Email", "This is a test email from your auth system backend.");
        return "Email dispatch triggered — check your inbox.";
    }
}