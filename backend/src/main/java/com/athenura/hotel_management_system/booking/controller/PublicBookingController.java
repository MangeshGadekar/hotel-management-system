package com.athenura.hotel_management_system.booking.controller;

import com.athenura.hotel_management_system.booking.dto.BookingResponse;
import com.athenura.hotel_management_system.booking.dto.GuestBookingRequest;
import com.athenura.hotel_management_system.booking.dto.GuestBookingResponse;
import com.athenura.hotel_management_system.booking.service.BookingService;
import com.athenura.hotel_management_system.booking.service.PublicBookingService;
import com.athenura.hotel_management_system.coupon.dto.CouponResponse;
import com.athenura.hotel_management_system.coupon.service.CouponService;
import com.athenura.hotel_management_system.payment.dto.PaymentDTO;
import com.athenura.hotel_management_system.room.entity.Room;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/public/booking")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicBookingController {

    private final PublicBookingService publicBookingService;
    private final BookingService bookingService;
    private final CouponService couponService;

    @PostMapping("/initiate")
    public ResponseEntity<GuestBookingResponse> initiateGuestBooking(@Valid @RequestBody GuestBookingRequest request) {
        GuestBookingResponse response = publicBookingService.createPublicBookingOrder(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<PaymentDTO.ReceiptResponse> verifyGuestPayment(@Valid @RequestBody PaymentDTO.RazorpayVerifyRequest request) {
        PaymentDTO.ReceiptResponse receipt = publicBookingService.verifyPublicBookingPayment(request);
        return ResponseEntity.ok(receipt);
    }

    @GetMapping("/available-rooms")
    public ResponseEntity<List<Room>> getAvailableRoomsForDates(
            @RequestParam("checkIn") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam("checkOut") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(value = "guests", required = false, defaultValue = "1") Integer guests
    ) {
        return ResponseEntity.ok(publicBookingService.searchAvailableRooms(checkIn, checkOut, guests));
    }

    @GetMapping("/coupons")
    public ResponseEntity<List<CouponResponse>> getPublicGuestCoupons() {
        return ResponseEntity.ok(couponService.getActiveCouponsForRole("GUEST"));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendManageBookingOtp(@RequestBody Map<String, String> payload) {
        String bookingId = payload.get("bookingId");
        String email = payload.get("email");
        publicBookingService.sendManageBookingOtp(bookingId, email);
        return ResponseEntity.ok(Map.of("message", "Verification code sent to " + email));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<BookingResponse> verifyManageBookingOtp(@RequestBody Map<String, String> payload) {
        String bookingId = payload.get("bookingId");
        String email = payload.get("email");
        String otp = payload.get("otp");
        BookingResponse response = publicBookingService.verifyManageBookingOtp(bookingId, email, otp);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/cancel/{bookingId}")
    public ResponseEntity<Map<String, String>> cancelGuestBooking(
            @PathVariable Long bookingId,
            @RequestParam String email) {
        try {
            publicBookingService.validateGuestBookingOwnership(bookingId, email);
            String resultMessage = bookingService.cancelBooking(bookingId);
            return ResponseEntity.ok(Map.of("message", resultMessage));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }
}