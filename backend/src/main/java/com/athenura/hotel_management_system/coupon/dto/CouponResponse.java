package com.athenura.hotel_management_system.coupon.dto;


import com.athenura.hotel_management_system.coupon.enums.DiscountType;
import com.athenura.hotel_management_system.room.enums.RoomType;
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
public class CouponResponse {
    private Long id;
    private String code;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minBookingAmount;
    private LocalDate validFrom;
    private LocalDate validUntil;
    private Integer usageLimit;
    private Integer timesUsed;
    private Boolean active;
    private Set<RoomType> applicableRoomTypes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
