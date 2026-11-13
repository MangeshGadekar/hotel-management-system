package com.athenura.hotel_management_system.coupon.dto;


import com.athenura.hotel_management_system.coupon.enums.CouponAudience;
import com.athenura.hotel_management_system.coupon.enums.DiscountType;
import com.athenura.hotel_management_system.room.enums.RoomType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponRequest {

    @NotBlank(message = "Coupon code is required")
    private String code;

    @NotNull(message = "Discount type is required(percentage or flat)")
    private DiscountType discountType;

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.01", message = "Discount value must be greater than 0")
    private BigDecimal discountValue;

    private BigDecimal minBookingAmount;

    @NotNull(message = "Valid from date is required")
    private LocalDate validFrom;

    @NotNull(message = "Valid until date is Required")
    private LocalDate validUntil;

    private Integer usageLimit;

    private Boolean active;

    private Set<RoomType> applicableRoomTypes;
    private CouponAudience targetAudience;

}
