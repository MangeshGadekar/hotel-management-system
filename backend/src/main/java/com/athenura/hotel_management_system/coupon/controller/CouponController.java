package com.athenura.hotel_management_system.coupon.controller;

import com.athenura.hotel_management_system.coupon.dto.CouponApplyResponse;
import com.athenura.hotel_management_system.coupon.dto.CouponRequest;
import com.athenura.hotel_management_system.coupon.dto.CouponResponse;
import com.athenura.hotel_management_system.coupon.dto.ValidateCouponRequest;
import com.athenura.hotel_management_system.coupon.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/create")
    public ResponseEntity<CouponResponse> createCoupon(
            @Valid @RequestBody CouponRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(couponService.createCoupon(request));
    }

    @GetMapping
    public ResponseEntity<List<CouponResponse>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @GetMapping("/{code}")
    public ResponseEntity<CouponResponse> getCouponByCode(@PathVariable String code) {
        return ResponseEntity.ok(couponService.getCouponByCode(code));
    }

    @PostMapping("/validate")
    public ResponseEntity<CouponApplyResponse> validateCoupon(
            @Valid @RequestBody ValidateCouponRequest request) {
        return ResponseEntity.ok(couponService.validateAndApplyCoupon(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok("Coupon deleted successfully");
    }
}