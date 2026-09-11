package com.athenura.hotel_management_system.common.controller;

import com.athenura.hotel_management_system.common.dto.LoginRequestDto;
import com.athenura.hotel_management_system.common.dto.RefreshTokenRequest;
import com.athenura.hotel_management_system.common.dto.TokenResponse;
import com.athenura.hotel_management_system.common.dto.UserRequestDto;
import com.athenura.hotel_management_system.common.dto.UserResponseDto;
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
    public ResponseEntity<UserResponseDto> signUpUser(
            @Valid @RequestBody UserRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.signUpUser(request));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(
            @Valid @RequestBody LoginRequestDto request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<TokenResponse> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }
}