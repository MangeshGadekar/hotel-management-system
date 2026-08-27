package com.athenura.hotel_management_system.booking.repository;

import com.athenura.hotel_management_system.booking.entity.Booking;
import com.athenura.hotel_management_system.booking.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // for creating a new booking
    @Query("""
        SELECT COUNT(b) > 0
        FROM Booking b
        WHERE b.room.id = :roomId
          AND b.bookingStatus = :bookingStatus
          AND b.checkInDate < :checkOutDate
          AND b.checkOutDate > :checkInDate
    """)
    boolean existsOverlappingBooking(
            @Param("roomId") Long roomId,
            @Param("bookingStatus") BookingStatus bookingStatus,
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate
    );

    // for updating an existing booking
    @Query("""
        SELECT COUNT(b) > 0
        FROM Booking b
        WHERE b.room.id = :roomId
          AND b.id <> :bookingId
          AND b.bookingStatus = :bookingStatus
          AND b.checkInDate < :checkOutDate
          AND b.checkOutDate > :checkInDate
    """)
    boolean existsOverlappingBookingForUpdate(
            @Param("bookingId") Long bookingId,
            @Param("roomId") Long roomId,
            @Param("bookingStatus") BookingStatus bookingStatus,
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate
    );
}
