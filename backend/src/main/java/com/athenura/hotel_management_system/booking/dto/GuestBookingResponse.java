package com.athenura.hotel_management_system.booking.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class GuestBookingResponse {
    private Long bookingId;
    private String razorpayOrderId;
    private String razorpayKeyId;
    private BigDecimal amountToPay;
    private String currency;
    private String guestEmail;
    private String guestName;
    private String guestPhone;
}