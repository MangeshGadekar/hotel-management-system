package com.athenura.hotel_management_system.coupon.dto;

import com.athenura.hotel_management_system.room.enums.RoomType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidateCouponRequest {
    
    @NotBlank(message  = "Coupon code is required")
    private String code;
    
    @NotNull(message = "Booking amount is required")
    @DecimalMin(value = "0.00", message = "Booking amount cannot be negative")
    private BigDecimal bookingAmount;

    private RoomType roomType;
    
}
