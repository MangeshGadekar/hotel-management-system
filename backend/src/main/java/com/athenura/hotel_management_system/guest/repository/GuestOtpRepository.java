package com.athenura.hotel_management_system.guest.repository;

import com.athenura.hotel_management_system.guest.entity.GuestOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GuestOtpRepository extends JpaRepository<GuestOtp, Long> {

    Optional<GuestOtp> findByEmail(String email);

    void deleteByEmail(String email);
}