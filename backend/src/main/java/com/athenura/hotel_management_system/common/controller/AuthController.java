package com.athenura.hotel_management_system.common.controller;

import com.athenura.hotel_management_system.common.dto.*;
import com.athenura.hotel_management_system.common.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<UserResponseDto>> signUpUser(
            @Valid @RequestBody UserRequestDto request) {
        UserResponseDto response = authService.signUpUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Registration successful!", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequestDto request) {
        LoginResponse loginResponse = authService.login(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful!", loginResponse));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<LoginResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        LoginResponse loginResponse = authService.refreshToken(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Token refreshed successfully!", loginResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok(new ApiResponse<>(true, "Logout successful!"));
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password reset link sent to your email!"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password reset successfully! You can now login."));
    }
}

