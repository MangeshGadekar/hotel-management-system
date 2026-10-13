package com.athenura.hotel_management_system.booking.dto;

import com.athenura.hotel_management_system.guest.dto.GuestRequest;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {

    private Long guestId;
// Guest details will come together with booking
    private GuestRequest guest;
    private Long roomId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private String paymentType;
    private String paymentMethod;
    private BigDecimal amount;
    private List<Long> extraServiceIds;
    private String transactionReference;
    private String couponCode;
}