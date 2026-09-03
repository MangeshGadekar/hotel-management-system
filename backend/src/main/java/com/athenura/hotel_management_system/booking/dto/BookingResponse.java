package com.athenura.hotel_management_system.booking.dto;

import com.athenura.hotel_management_system.booking.enums.BookingStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private Long id;

    // Guest Details
    private Long guestId;
    private String guestName;

    // Room Details
    private Long roomId;
    private String roomNumber;
    private String roomType;

    // Receptionist Details (Null for customer bookings)
    private Long receptionistId;
    private String receptionistName;

    // Booking Details
    private LocalDate checkInDate;
    private LocalDate checkOutDate;

    private BigDecimal totalAmount;

    private BookingStatus bookingStatus;
}