package com.athenura.hotel_management_system.coupon.mapper;

import com.athenura.hotel_management_system.coupon.dto.CouponRequest;
import com.athenura.hotel_management_system.coupon.dto.CouponResponse;
import com.athenura.hotel_management_system.coupon.entity.Coupon;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashSet;

@Component
public class CouponMapper {
    public Coupon toEntity(CouponRequest request){
        if(request == null){
            return null;
        }

        return Coupon.builder()
                .code(request.getCode().trim().toUpperCase())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minBookingAmount(request.getMinBookingAmount() != null ? request.getMinBookingAmount() : BigDecimal.ZERO)
                .validFrom(request.getValidFrom())
                .validUntil(request.getValidUntil())
                .usageLimit(request.getUsageLimit())
                .timesUsed(0)
                .active(request.getActive() != null ? request.getActive() : true)
                .applicableRoomTypes(request.getApplicableRoomTypes() != null ? request.getApplicableRoomTypes() : new HashSet<>())
                .build();

    }

    public CouponResponse toResponse(Coupon entity) {
        if (entity == null) {
            return null;
        }

        return CouponResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .discountType(entity.getDiscountType())
                .discountValue(entity.getDiscountValue())
                .minBookingAmount(entity.getMinBookingAmount())
                .validFrom(entity.getValidFrom())
                .validUntil(entity.getValidUntil())
                .usageLimit(entity.getUsageLimit())
                .timesUsed(entity.getTimesUsed())
                .active(entity.getActive())
                .applicableRoomTypes(entity.getApplicableRoomTypes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }



}
