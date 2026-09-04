package com.athenura.hotel_management_system.common.repository;

import com.athenura.hotel_management_system.common.entity.RefreshToken;
import com.athenura.hotel_management_system.common.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepo extends JpaRepository<RefreshToken,Long> {

    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByUser(Users user);
}