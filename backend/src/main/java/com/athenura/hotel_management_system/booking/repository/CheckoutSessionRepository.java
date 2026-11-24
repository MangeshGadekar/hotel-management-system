package com.athenura.hotel_management_system.booking.repository;

import com.athenura.hotel_management_system.booking.entity.CheckoutSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface CheckoutSessionRepository extends JpaRepository<CheckoutSession, String> {

    Optional<CheckoutSession> findByRazorpayOrderId(String razorpayOrderId);

    @Modifying
    @Query("DELETE FROM CheckoutSession c WHERE c.createdAt < :cutoff")
    void deleteExpiredSessions(@Param("cutoff") LocalDateTime cutoff);
}