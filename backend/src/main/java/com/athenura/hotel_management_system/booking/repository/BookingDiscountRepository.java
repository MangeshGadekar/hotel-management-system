package com.athenura.hotel_management_system.booking.repository;

import com.athenura.hotel_management_system.booking.entity.BookingDiscount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingDiscountRepository extends JpaRepository<BookingDiscount, Long> {
    List<BookingDiscount> findByBookingIdOrderByCreatedAtAsc(Long bookingId);
    List<BookingDiscount> findByReceiptNumber(String receiptNumber);
    List<BookingDiscount> findByBookingId(Long bookingId);
}