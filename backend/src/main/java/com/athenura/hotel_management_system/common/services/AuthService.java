package com.athenura.hotel_management_system.common.services;

import com.athenura.hotel_management_system.common.dto.LoginRequestDto;
import com.athenura.hotel_management_system.common.dto.RefreshTokenRequest;
import com.athenura.hotel_management_system.common.dto.TokenResponse;
import com.athenura.hotel_management_system.common.entity.RefreshToken;
import com.athenura.hotel_management_system.common.entity.Users;
import com.athenura.hotel_management_system.common.repository.UserRepo;
import com.athenura.hotel_management_system.jwt.JwtService;
import lombok.RequiredArgsConstructor;
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

    public Users signUpUser(Users user) {

        userRepo.findByEmail(user.getEmail())
                .ifPresent(u -> {
                    throw new RuntimeException("User with email " + u.getEmail() + " already exists");
                });

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepo.save(user);
    }

    public TokenResponse login(LoginRequestDto request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        Users user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String accessToken = jwtService.generateToken(user);

        RefreshToken refreshToken =
                refreshTokenService.createRefreshToken(user);

        return new TokenResponse(
                accessToken,
                refreshToken.getToken()
        );
    }



    public TokenResponse refreshToken(RefreshTokenRequest request) {

        // Find Refresh Token
        RefreshToken refreshToken =
                refreshTokenService.findByToken(request.getRefreshToken());

        // Verify Expiry
        refreshTokenService.verifyExpiration(refreshToken);

        // Rotate Refresh Token
        RefreshToken newRefreshToken =
                refreshTokenService.rotateRefreshToken(refreshToken);

        // Generate New Access Token
        String accessToken =
                jwtService.generateToken(newRefreshToken.getUser());

        // Return Tokens
        return new TokenResponse(
                accessToken,
                newRefreshToken.getToken()
        );
    }
}