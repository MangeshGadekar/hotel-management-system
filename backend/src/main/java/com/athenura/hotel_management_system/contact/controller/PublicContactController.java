package com.athenura.hotel_management_system.contact.controller;

import com.athenura.hotel_management_system.contact.dto.ContactInquiryRequestDTO;
import com.athenura.hotel_management_system.notification.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public/contact")
@RequiredArgsConstructor
public class PublicContactController {

    private final EmailService emailService;

    @PostMapping
    public Map submitContactInquiry(
            @Valid @RequestBody ContactInquiryRequestDTO requestDTO
    ) {
        emailService.sendContactInquiry(
                requestDTO.getName(),
                requestDTO.getEmail(),
                requestDTO.getPhone(),
                requestDTO.getSubject(),
                requestDTO.getMessage()
        );
        return Map.of("message", "Your inquiry has been sent to Hotel Athitya.");
    }
}