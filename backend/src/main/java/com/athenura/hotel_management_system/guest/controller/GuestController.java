package com.athenura.hotel_management_system.guest.controller;

import com.athenura.hotel_management_system.guest.dto.GuestRequest;
import com.athenura.hotel_management_system.guest.dto.GuestResponse;
import com.athenura.hotel_management_system.guest.dto.VerifyOtpRequest;
import com.athenura.hotel_management_system.guest.service.GuestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/guest")
@RequiredArgsConstructor
public class GuestController {

    private final GuestService guestService;

    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailExists(@RequestParam String email) {
        return ResponseEntity.ok(guestService.checkEmailExists(email));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(@RequestParam String email) {
        return ResponseEntity.ok(guestService.sendOtp(email));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<GuestResponse> verifyOtpAndGetGuest(@Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(guestService.verifyOtpAndGetGuest(request));
    }

    @PostMapping("/create")
    public ResponseEntity<GuestResponse> createGuest(@Valid @RequestBody GuestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(guestService.createGuest(request));
    }

    @GetMapping("/by-email")
    public ResponseEntity<GuestResponse> getGuestByEmail(@RequestParam String email) {
        return ResponseEntity.ok(guestService.getGuestByEmail(email));
    }

    @PatchMapping("/update/{id}")
    public ResponseEntity<GuestResponse> updateGuest(
            @PathVariable Long id,
            @RequestBody GuestRequest request) {

        return ResponseEntity.ok(guestService.updateGuest(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GuestResponse> getGuestById(@PathVariable Long id) {
        return ResponseEntity.ok(guestService.getGuestById(id));
    }

    @GetMapping
    public ResponseEntity<List<GuestResponse>> getAllGuests() {
        return ResponseEntity.ok(guestService.getAllGuests());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteGuest(@PathVariable Long id) {
        return ResponseEntity.ok(guestService.deleteGuest(id));
    }
}