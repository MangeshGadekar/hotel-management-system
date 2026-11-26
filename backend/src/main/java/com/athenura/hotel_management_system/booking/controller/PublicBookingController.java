package com.athenura.hotel_management_system.booking.controller;

import com.athenura.hotel_management_system.booking.dto.BookingResponse;
import com.athenura.hotel_management_system.booking.dto.GuestBookingRequest;
import com.athenura.hotel_management_system.booking.dto.GuestBookingResponse;
import com.athenura.hotel_management_system.booking.entity.Booking;
import com.athenura.hotel_management_system.booking.repository.BookingRepository;
import com.athenura.hotel_management_system.booking.service.BookingService;
import com.athenura.hotel_management_system.booking.service.MasterReceiptPdfService;
import com.athenura.hotel_management_system.booking.service.PublicBookingService;
import com.athenura.hotel_management_system.coupon.dto.CouponResponse;
import com.athenura.hotel_management_system.coupon.service.CouponService;
import com.athenura.hotel_management_system.jwt.JwtService;
import com.athenura.hotel_management_system.payment.dto.PaymentDTO;
import com.athenura.hotel_management_system.room.entity.Room;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
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
    private final JwtService jwtService;
    private final BookingRepository bookingRepository;

    private final MasterReceiptPdfService masterReceiptPdfService;

    @PostMapping("/initiate")
    public ResponseEntity<GuestBookingResponse> initiateGuestBooking(@Valid @RequestBody GuestBookingRequest request) {
        GuestBookingResponse response = publicBookingService.createPublicBookingOrder(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyGuestPayment(@Valid @RequestBody PaymentDTO.RazorpayVerifyRequest request) {
        PaymentDTO.ReceiptResponse receipt = publicBookingService.verifyPublicBookingPayment(request);

        Booking booking = bookingRepository.findById(request.getBookingId()).orElse(null);
        String bookingReference = (booking != null) ? booking.getBookingReference() : null;

        return ResponseEntity.ok(Map.of(
                "receipt", receipt,
                "bookingReference", bookingReference != null ? bookingReference : ""
        ));
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
    public ResponseEntity<?> verifyManageBookingOtp(@RequestBody Map<String, Object> payload) {
        String bookingIdentifier = null;
        if (payload.get("bookingId") != null) {
            bookingIdentifier = payload.get("bookingId").toString();
        } else if (payload.get("bookingReference") != null) {
            bookingIdentifier = payload.get("bookingReference").toString();
        }

        String email = payload.get("email") != null ? payload.get("email").toString() : null;
        String otp = payload.get("otp") != null ? payload.get("otp").toString() : null;

        if (bookingIdentifier == null || email == null || otp == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Booking identifier, email, and OTP are required"));
        }

        BookingResponse booking = publicBookingService.verifyManageBookingOtp(bookingIdentifier, email, otp);
        if (booking == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid or expired OTP"));
        }

        Long numericBookingId = booking.getId();
        String guestToken = jwtService.generateGuestAccessToken(numericBookingId, email);

        return ResponseEntity.ok(Map.of(
                "token", guestToken,
                "booking", booking
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getManagedBooking(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authorization token required"));
        }

        String token = authHeader.substring(7);

        Long tokenBookingId = jwtService.extractBookingId(token);
        String tokenEmail = jwtService.extractUsername(token);

        if (!jwtService.isGuestTokenValid(token, id, tokenEmail) || !id.equals(tokenBookingId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Session expired or unauthorized booking access"));
        }

        // Use BookingResponse instead of Booking
        BookingResponse booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
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

    @PostMapping("/abandon/{bookingId}")
    public ResponseEntity<?> abandonPendingBooking(@PathVariable Long bookingId) {
        publicBookingService.abandonPendingBooking(bookingId);
        return ResponseEntity.ok(Map.of("message", "Pending booking discarded"));
    }


    @GetMapping("/{bookingIdentifier}/check-in-receipt-pdf")
    public ResponseEntity<byte[]> downloadPublicCheckInReceipt(@PathVariable String bookingIdentifier) {
        Booking booking;
        try {
            Long id = Long.parseLong(bookingIdentifier);
            BookingResponse response = bookingService.getBookingById(id);
            booking = publicBookingService.findByBookingReference(bookingIdentifier);
        } catch (NumberFormatException e) {
            booking = publicBookingService.findByBookingReference(bookingIdentifier);
        }

        byte[] pdfBytes = masterReceiptPdfService.generateCheckInReceipt(booking, "ONLINE_GUEST");
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=Receipt_" + bookingIdentifier + ".pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/{bookingIdentifier}/booking-receipt-pdf")
    public ResponseEntity<byte[]> downloadPublicBookingReceipt(@PathVariable String bookingIdentifier) {
        Booking booking = publicBookingService.findByBookingReference(bookingIdentifier);
        byte[] pdfBytes = masterReceiptPdfService.generateBookingPdf(booking, "ONLINE_GUEST");

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=Booking_" + bookingIdentifier + ".pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}