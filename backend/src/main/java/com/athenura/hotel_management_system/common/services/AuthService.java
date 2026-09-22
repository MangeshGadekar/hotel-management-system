package com.athenura.hotel_management_system.common.services;

import com.athenura.hotel_management_system.common.dto.LoginRequestDto;
import com.athenura.hotel_management_system.common.dto.RefreshTokenRequest;
import com.athenura.hotel_management_system.common.dto.TokenResponse;
import com.athenura.hotel_management_system.common.dto.UserRequestDto;
import com.athenura.hotel_management_system.common.dto.UserResponseDto;
import com.athenura.hotel_management_system.common.entity.RefreshToken;
import com.athenura.hotel_management_system.common.entity.Users;
import com.athenura.hotel_management_system.common.enums.Role;
import com.athenura.hotel_management_system.common.repository.UserRepo;
import com.athenura.hotel_management_system.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepo userRepo;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Value("${app.security.admin-secret-key}")
    private String configuredAdminSecretKey;


    public UserResponseDto signUpUser(UserRequestDto request) {

        if (request.getRole() == Role.ADMIN) {
            if (userRepo.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email address is already registered!");
            }
            if (request.getSecretKey() == null || !request.getSecretKey().equals(configuredAdminSecretKey)) {
                throw new RuntimeException("Invalid Admin Secret Key!");
            }
        } else {
            throw new RuntimeException("Direct registration for this role is not allowed!");
        }

        Users newUser = Users.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .secretKey(request.getSecretKey())
                .build();

        Users savedUser = userRepo.save(newUser);
        return mapToUserResponseDto(savedUser);
    }


    public TokenResponse login(LoginRequestDto request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        Users user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));

        String accessToken = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return new TokenResponse(accessToken, refreshToken.getToken());
    }

    public TokenResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService.findByToken(request.getRefreshToken());
        refreshTokenService.verifyExpiration(refreshToken);
        RefreshToken newRefreshToken = refreshTokenService.rotateRefreshToken(refreshToken);
        String accessToken = jwtService.generateToken(newRefreshToken.getUser());

        return new TokenResponse(accessToken, newRefreshToken.getToken());
    }

    public void logout(String refreshToken) {
        refreshTokenService.deleteByToken(refreshToken);
    }

    private UserResponseDto mapToUserResponseDto(Users user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .secretKey(user.getSecretKey())
                .build();
    }
}