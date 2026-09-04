package com.athenura.hotel_management_system.common.services;

import java.time.Instant;
import java.util.UUID;

import com.athenura.hotel_management_system.common.entity.RefreshToken;
import com.athenura.hotel_management_system.common.entity.Users;
import com.athenura.hotel_management_system.common.repository.RefreshTokenRepo;
import org.springframework.stereotype.Service;


import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepo refreshTokenRepo;

    public RefreshToken createRefreshToken(Users user) {

        // Agar user ka purana refresh token hai to delete kar do
        refreshTokenRepo.findByUser(user)
                .ifPresent(refreshTokenRepo::delete);

        RefreshToken refreshToken = new RefreshToken();


        refreshToken.setUser(user);

        refreshToken.setToken(UUID.randomUUID().toString());

        refreshToken.setExpiryDate(
                Instant.now().plusSeconds(7 * 24 * 60 * 60));

        return refreshTokenRepo.save(refreshToken);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {

        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepo.delete(token);
            throw new RuntimeException("Refresh token expired");
        }

        return token;
    }

    public RefreshToken findByToken(String token) {

        return refreshTokenRepo.findByToken(token)
                .orElseThrow(
                        () -> new RuntimeException("Refresh token not found"));
    }

    public RefreshToken rotateRefreshToken(RefreshToken oldToken) {

        refreshTokenRepo.delete(oldToken);

        RefreshToken newToken = new RefreshToken();

        newToken.setUser(oldToken.getUser());
        newToken.setToken(UUID.randomUUID().toString());
        newToken.setExpiryDate(oldToken.getExpiryDate());

        return refreshTokenRepo.save(newToken);
    }
}
