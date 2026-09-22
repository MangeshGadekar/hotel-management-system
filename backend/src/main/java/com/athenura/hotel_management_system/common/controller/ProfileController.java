package com.athenura.hotel_management_system.common.controller;

import com.athenura.hotel_management_system.common.dto.ApiResponse;
import com.athenura.hotel_management_system.common.dto.ProfileUpdateRequest;
import com.athenura.hotel_management_system.common.dto.UserResponseDto;
import com.athenura.hotel_management_system.common.services.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ApiResponse<UserResponseDto>> getProfile(Authentication authentication) {
        UserResponseDto profile = profileService.getProfile(authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile retrieved successfully", profile));
    }

    @PatchMapping("/edit")
    public ResponseEntity<ApiResponse<UserResponseDto>> updateProfile(
            Authentication authentication,
            @RequestBody ProfileUpdateRequest request) {
        UserResponseDto updatedProfile = profileService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated successfully", updatedProfile));
    }
}