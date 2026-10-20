package com.athenura.hotel_management_system.coupon.service.impl;

import com.athenura.hotel_management_system.coupon.dto.CouponApplyResponse;
import com.athenura.hotel_management_system.coupon.dto.CouponRequest;
import com.athenura.hotel_management_system.coupon.dto.CouponResponse;
import com.athenura.hotel_management_system.coupon.dto.ValidateCouponRequest;
import com.athenura.hotel_management_system.coupon.entity.Coupon;
import com.athenura.hotel_management_system.coupon.enums.DiscountType;
import com.athenura.hotel_management_system.coupon.mapper.CouponMapper;
import com.athenura.hotel_management_system.coupon.repository.CouponRepository;
import com.athenura.hotel_management_system.coupon.service.CouponService;
import com.athenura.hotel_management_system.room.enums.RoomType;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final CouponMapper couponMapper;

    @Override
    @Transactional
    public CouponResponse createCoupon(CouponRequest request) {
        if (couponRepository.existsByCodeIgnoreCase(request.getCode())){
            throw new RuntimeException("Coupon with code " + request.getCode() + "already exists");
        }
        Coupon coupon = couponMapper.toEntity(request);
        Coupon savedCoupon = couponRepository.save(coupon);
        return couponMapper.toResponse(savedCoupon);
    }

    @Override
    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(couponMapper::toResponse)
                .toList();
    }

    @Override
    public CouponResponse getCouponByCode(String code) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new RuntimeException("Coupon not found: " + code));
        return couponMapper.toResponse(coupon);
    }

    @Override
    public CouponApplyResponse validateAndApplyCoupon(ValidateCouponRequest request) {
        BigDecimal discount = calculateDiscount(request.getCode(), request.getBookingAmount(), request.getRoomType());
        BigDecimal finalAmount = request.getBookingAmount().subtract(discount);

        return CouponApplyResponse.builder()
                .code(request.getCode().trim().toUpperCase())
                .originalAmount(request.getBookingAmount())
                .discountAmount(discount)
                .finalAmount(finalAmount)
                .message("Coupon applied successfully!")
                .build();
    }

    @Override
    public BigDecimal calculateDiscount(String code, BigDecimal bookingAmount, RoomType roomType) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new RuntimeException("Coupon '" + code + "' is invalid!"));

        LocalDate today = LocalDate.now();

        if (Boolean.FALSE.equals(coupon.getActive())) {
            throw new RuntimeException("Coupon is no longer active");
        }
        if (today.isBefore(coupon.getValidFrom())) {
            throw new RuntimeException("Coupon is not valid yet");
        }
        if (today.isAfter(coupon.getValidUntil())) {
            throw new RuntimeException("Coupon has expired");
        }
        if (coupon.getUsageLimit() != null && coupon.getTimesUsed() >= coupon.getUsageLimit()) {
            throw new RuntimeException("Coupon usage limit has been reached");
        }
        if (coupon.getMinBookingAmount() != null && bookingAmount.compareTo(coupon.getMinBookingAmount()) < 0) {
            throw new RuntimeException("Minimum booking amount to use this coupon is ₹" + coupon.getMinBookingAmount());
        }

        if (coupon.getApplicableRoomTypes() != null && !coupon.getApplicableRoomTypes().isEmpty()) {
            if (roomType == null || !coupon.getApplicableRoomTypes().contains(roomType)) {
                throw new RuntimeException("Coupon '" + code + "' is not applicable for room type: " + roomType);
            }
        }



        BigDecimal discount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = bookingAmount.multiply(coupon.getDiscountValue().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
        } else {
            discount = coupon.getDiscountValue();
        }

        if (discount.compareTo(bookingAmount) > 0) {
            discount = bookingAmount;
        }

        return discount.setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    @Transactional
    public void incrementUsage(String code) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new RuntimeException("Coupon not found: " + code));
        coupon.setTimesUsed(coupon.getTimesUsed() + 1);
        couponRepository.save(coupon);
    }

    @Override
    @Transactional
    public void deleteCoupon(Long id) {
            if (!couponRepository.existsById(id)) {
                throw new RuntimeException("Coupon not found with id: " + id);
            }
            couponRepository.deleteById(id);
    }
}

