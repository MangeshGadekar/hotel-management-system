package com.athenura.hotel_management_system.guest.repository;

import com.athenura.hotel_management_system.guest.entity.GuestOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface GuestOtpRepository extends JpaRepository<GuestOtp, Long> {

    Optional<GuestOtp> findByEmailIgnoreCase(String email);

    @Modifying
    @Transactional
    @Query("DELETE FROM GuestOtp g WHERE LOWER(g.email) = LOWER(:email)")
    void deleteByEmailIgnoreCase(String email);
}