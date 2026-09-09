package com.athenura.hotel_management_system.booking.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {

    private Long guestId;

    private Long roomId;

    private LocalDate checkInDate;

    private LocalDate checkOutDate;
}