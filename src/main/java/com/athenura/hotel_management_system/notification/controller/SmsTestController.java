package com.athenura.hotel_management_system.notification.controller;

import com.athenura.hotel_management_system.notification.service.SmsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
public class SmsTestController {

    private final SmsService smsService;

    @PostMapping("/sms")
    public ResponseEntity<String> sendTestSms(
            @RequestParam String phoneNumber
    ) {

        smsService.sendSms(
                phoneNumber,
                "Hello! Twilio SMS is working successfully."
        );

        return ResponseEntity.ok("SMS sent successfully");
    }
}