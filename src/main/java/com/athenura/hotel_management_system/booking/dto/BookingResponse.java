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


    private Long guestId;
    private String guestName;


    private Long roomId;
    private String roomNumber;
    private String roomType;


    private Long receptionistId;
    private String receptionistName;


    private LocalDate checkInDate;
    private LocalDate checkOutDate;

    private BigDecimal totalAmount;

    private BookingStatus bookingStatus;
}