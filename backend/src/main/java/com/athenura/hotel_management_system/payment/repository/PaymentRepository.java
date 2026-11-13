package com.athenura.hotel_management_system.payment.repository;

import com.athenura.hotel_management_system.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByReceiptNumber(String receiptNumber);

    List<Payment> findByBookingId(Long bookingId);

    @Query(" SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.booking.id = :bId ANd p.paymentStatus = 'SUCCESS'")
    BigDecimal sumPaidByBookingId(@Param("bId")Long bookingId);

    @Query("""
        SELECT COALESCE(SUM(p.amount), 0)
        FROM Payment p
        WHERE p.paymentStatus = 'SUCCESS'
        """)

    BigDecimal getTotalRevenue();

    @Query("""
        SELECT COALESCE(SUM(p.amount), 0)
        FROM Payment p
        WHERE p.paymentStatus = 'SUCCESS'
        AND p.paymentDate >= :start
        AND p.paymentDate < :end
        """)

    BigDecimal getRevenueBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    

}




