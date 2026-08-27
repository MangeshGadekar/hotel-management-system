package com.athenura.hotel_management_system.common.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.athenura.hotel_management_system.admin.mapper.AdminUserMapper;
import com.athenura.hotel_management_system.common.dto.LoginRequestDto;
import com.athenura.hotel_management_system.common.dto.RefreshTokenRequest;
import com.athenura.hotel_management_system.common.dto.TokenResponse;
import com.athenura.hotel_management_system.common.dto.UserRequestDto;
import com.athenura.hotel_management_system.common.dto.UserResponseDto;
import com.athenura.hotel_management_system.common.entity.Users;
import com.athenura.hotel_management_system.common.services.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AdminUserMapper adminUserMapper;
    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<UserResponseDto> signUpUser(
            @RequestBody UserRequestDto request) {

        Users user = adminUserMapper.userToDto(request);

        Users savedUser = authService.signUpUser(user);

        UserResponseDto response = adminUserMapper.userResponseToEntity(savedUser);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(
            @RequestBody LoginRequestDto request) {

        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<TokenResponse> refreshToken(
            @RequestBody RefreshTokenRequest request) {

        return ResponseEntity.ok(authService.refreshToken(request));
    }

}
