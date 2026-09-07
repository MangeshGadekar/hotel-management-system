package com.athenura.hotel_management_system.guest.controller;

import com.athenura.hotel_management_system.common.entity.Users;
import com.athenura.hotel_management_system.guest.dto.GuestRequest;
import com.athenura.hotel_management_system.guest.dto.GuestResponse;
import com.athenura.hotel_management_system.guest.service.GuestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/guest")
@RequiredArgsConstructor
public class GuestController {

    private final GuestService guestService;


    @GetMapping("/my-profile")
    public ResponseEntity<GuestResponse> getMyProfile(@AuthenticationPrincipal Users loggedInUser) {
        return ResponseEntity.ok(guestService.getGuestByEmail(loggedInUser.getEmail()));
    }


    @PatchMapping("/update-profile")
    public ResponseEntity<GuestResponse> updateMyProfile(
            @AuthenticationPrincipal Users loggedInUser,
            @RequestBody GuestRequest request) {
        return ResponseEntity.ok(guestService.updateGuestByEmail(loggedInUser.getEmail(), request));
    }


    @PostMapping("/create")
    public ResponseEntity<GuestResponse> createGuest(@RequestBody GuestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(guestService.createGuest(request));
    }

    @GetMapping
    public ResponseEntity<List<GuestResponse>> getAllGuests() {
        return ResponseEntity.ok(guestService.getAllGuests());
    }


    @GetMapping("/{id}")
    public ResponseEntity<GuestResponse> getGuestById(@PathVariable Long id) {
        return ResponseEntity.ok(guestService.getGuestById(id));
    }


    @PatchMapping("/update/{id}")
    public ResponseEntity<GuestResponse> updateGuest(@PathVariable Long id, @RequestBody GuestRequest request) {
        return ResponseEntity.ok(guestService.updateGuest(id, request));
    }


    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteGuest(@PathVariable Long id) {
        return ResponseEntity.ok(guestService.deleteGuest(id));
    }
}