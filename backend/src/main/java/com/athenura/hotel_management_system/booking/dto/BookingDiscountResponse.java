package com.athenura.hotel_management_system.booking.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDiscountResponse {

    private Long id;
    private Long bookingId;
    private String receiptNumber;
    private String discountSource;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal calculatedAmount;
    private String reason;
    private LocalDateTime createdAt;
}