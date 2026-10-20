package com.athenura.hotel_management_system.coupon.service;

import com.athenura.hotel_management_system.coupon.dto.CouponApplyResponse;
import com.athenura.hotel_management_system.coupon.dto.CouponRequest;
import com.athenura.hotel_management_system.coupon.dto.CouponResponse;
import com.athenura.hotel_management_system.coupon.dto.ValidateCouponRequest;
import com.athenura.hotel_management_system.room.enums.RoomType;

import java.math.BigDecimal;
import java.util.List;

public interface CouponService {
    CouponResponse createCoupon(CouponRequest request);
    List<CouponResponse> getAllCoupons();
    CouponResponse getCouponByCode(String code);
    CouponApplyResponse validateAndApplyCoupon(ValidateCouponRequest request);
    BigDecimal calculateDiscount(String code, BigDecimal bookingAmount, RoomType roomType);
    void incrementUsage(String code);
    void deleteCoupon(Long id);
}
