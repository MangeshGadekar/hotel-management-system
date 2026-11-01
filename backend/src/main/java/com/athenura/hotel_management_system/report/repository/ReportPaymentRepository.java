package com.athenura.hotel_management_system.report.repository;

import com.athenura.hotel_management_system.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ReportPaymentRepository extends JpaRepository<Payment, Long> {


    @Query("""
        SELECT p.booking.id, COALESCE(SUM(p.amount), 0)
        FROM Payment p
        WHERE p.booking.id IN :bookingIds
          AND p.paymentStatus = 'SUCCESS'
        GROUP BY p.booking.id
    """)
    List<Object[]> sumPaidGroupedByBooking(@Param("bookingIds") Collection<Long> bookingIds);
}