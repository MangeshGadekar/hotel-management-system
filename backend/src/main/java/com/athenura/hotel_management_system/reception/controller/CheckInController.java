package com.athenura.hotel_management_system.reception.controller;

import com.athenura.hotel_management_system.checkin.service.CheckInOtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/receptionist")
@RequiredArgsConstructor
public class CheckInController {

    private final CheckInOtpService checkInOtpService;

    @PostMapping("/send-otp/{bookingId}")
    public ResponseEntity<String> sendOtp( @PathVariable Long bookingId ) {

        checkInOtpService.sendOtp(bookingId);

        return ResponseEntity.ok("OTP sent successfully");
    }

    @PostMapping("/verify/{bookingId}")
    public ResponseEntity<String> verifyOtp(
            @PathVariable Long bookingId,
            @RequestParam String otp) {

        checkInOtpService.verifyOtp(bookingId, otp);

        return ResponseEntity.ok(
                "OTP verified successfully. Checked in."
        );
    }
}
