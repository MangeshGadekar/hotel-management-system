package com.athenura.hotel_management_system.booking.controller;

import com.athenura.hotel_management_system.booking.dto.*;
import com.athenura.hotel_management_system.booking.service.BookingService;
import com.athenura.hotel_management_system.booking.service.PublicBookingService;
import com.athenura.hotel_management_system.room.entity.Room;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/booking")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final PublicBookingService publicBookingService;

    @PostMapping("/create")
    public ResponseEntity<BookingResponse> createBooking(
            @RequestBody BookingRequest request,
            Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(request, principal != null ? principal.getName() : null));
    }

    @PatchMapping("/update/{id}")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable Long id,
            @RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.updateBooking(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @PatchMapping("/cancel/{id}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(bookingService.cancelBooking(id));
        } catch (RuntimeException e) {
            log.warn("Booking cancellation rejected for #{}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/check-in")
    public ResponseEntity<BookingResponse> checkInGuest(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(bookingService.checkInGuest(id, principal != null ? principal.getName() : null));
    }

    @PatchMapping("/{id}/check-out")
    public ResponseEntity<BookingResponse> checkOutGuest(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.checkOutGuest(id));
    }

    @PostMapping("/{bookingId}/add-services")
    public ResponseEntity<BookingResponse> addExtraServices(
            @PathVariable Long bookingId,
            @RequestBody List<Long> extraServiceIds) {
        return ResponseEntity.ok(bookingService.addExtraServicesToBooking(bookingId, extraServiceIds));
    }

    @PostMapping("/{bookingId}/add-custom-service")
    public ResponseEntity<BookingResponse> addCustomService(
            @PathVariable Long bookingId,
            @RequestBody CustomServiceRequest request) {
        return ResponseEntity.ok(bookingService.addCustomServiceToBooking(bookingId, request));
    }

    @DeleteMapping("/{bookingId}/remove-service/{serviceId}")
    public ResponseEntity<BookingResponse> removeExtraService(
            @PathVariable Long bookingId,
            @PathVariable Long serviceId) {
        return ResponseEntity.ok(bookingService.removeExtraServiceFromBooking(bookingId, serviceId));
    }

    @PatchMapping("/{id}/apply-discount")
    public ResponseEntity<BookingResponse> applyDiscount(
            @PathVariable Long id,
            @RequestParam BigDecimal discountValue,
            @RequestParam(defaultValue = "FLAT") String discountType,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(bookingService.applyPostBookingDiscount(id, discountValue, discountType, reason));
    }

    @PostMapping("/{bookingId}/settle-payment")
    public ResponseEntity<BookingResponse> settlePayment(
            @PathVariable Long bookingId,
            @RequestParam BigDecimal amount,
            @RequestParam(defaultValue = "CASH") String paymentMethod,
            @RequestParam(required = false) List<Long> serviceIds,
            @RequestParam(required = false) BigDecimal discountAmount,
            @RequestParam(required = false) String discountReason) {

        List<Long> safeServiceIds = (serviceIds != null) ? serviceIds : Collections.emptyList();
        BigDecimal safeDiscount = (discountAmount != null) ? discountAmount : BigDecimal.ZERO;

        return ResponseEntity.ok(bookingService.settlePartialServicePayment(
                bookingId,
                safeServiceIds,
                amount,
                paymentMethod,
                safeDiscount,
                discountReason
        ));
    }

    @GetMapping("/{id}/settlement-breakdown")
    public ResponseEntity<BookingSettlementResponse> getSettlementBreakdown(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getSettlementBreakdown(id));
    }

    @GetMapping("/{id}/discounts")
    public ResponseEntity<List<BookingDiscountResponse>> getBookingDiscounts(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingDiscounts(id));
    }

    @PatchMapping("/{id}/extend-stay")
    public ResponseEntity<BookingResponse> extendStay(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate newCheckOutDate) {
        return ResponseEntity.ok(bookingService.extendStay(id, newCheckOutDate));
    }

    @PatchMapping("/{id}/switch-room")
    public ResponseEntity<BookingResponse> switchRoom(
            @PathVariable Long id,
            @RequestParam Long targetRoomId,
            @RequestParam(required = false) String reason,
            @RequestParam(required = false) Long sourceRoomId) {
        return ResponseEntity.ok(bookingService.switchRoom(id, targetRoomId, reason, sourceRoomId));
    }

    @GetMapping("/guest/{guestId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByGuestId(@PathVariable Long guestId) {
        return ResponseEntity.ok(bookingService.getBookingsByGuestId(guestId));
    }

    @GetMapping("/available-rooms")
    public ResponseEntity<List<Room>> getAdminAvailableRooms(
            @RequestParam("checkIn") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam("checkOut") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(value = "guests", required = false, defaultValue = "1") Integer guests) {
        return ResponseEntity.ok(publicBookingService.searchAvailableRooms(checkIn, checkOut, guests));
    }



    //pdf-----

    @GetMapping("/{bookingId}/check-in-receipt-pdf")
    public ResponseEntity<byte[]> downloadCheckInReceipt(
            @PathVariable Long bookingId,
            @RequestParam(required = false) String preparedBy,
            Principal principal) {
        byte[] pdf = bookingService.generateCheckInSlipPdf(bookingId, preparedBy, principal != null ? principal.getName() : null);
        return buildPdfResponse(pdf, "CheckIn_Receipt_" + bookingId + ".pdf");
    }

    @GetMapping("/{bookingId}/service-receipt-pdf")
    public ResponseEntity<byte[]> downloadServiceReceipt(
            @PathVariable Long bookingId,
            @RequestParam(required = false) String preparedBy,
            Principal principal) {
        byte[] pdf = bookingService.generateServiceSlipPdf(bookingId, preparedBy, principal != null ? principal.getName() : null);
        return buildPdfResponse(pdf, "Service_Receipt_" + bookingId + ".pdf");
    }

    @GetMapping("/{bookingId}/master-receipt-pdf")
    public ResponseEntity<byte[]> downloadMasterReceipt(
            @PathVariable Long bookingId,
            @RequestParam(required = false) String preparedBy,
            Principal principal) {
        byte[] pdf = bookingService.generateMasterFolioPdf(bookingId, preparedBy, principal != null ? principal.getName() : null);
        return buildPdfResponse(pdf, "Master_Folio_" + bookingId + ".pdf");
    }

    @GetMapping("/{bookingId}/payment/{paymentId}/receipt-pdf")
    public ResponseEntity<byte[]> downloadPaymentReceipt(
            @PathVariable Long bookingId,
            @PathVariable Long paymentId,
            @RequestParam(required = false) String preparedBy,
            Principal principal) {
        byte[] pdf = bookingService.generatePaymentSlipPdf(bookingId, paymentId, preparedBy, principal != null ? principal.getName() : null);
        return buildPdfResponse(pdf, "Receipt_" + paymentId + ".pdf");
    }

    @GetMapping("/receipt-by-number/{receiptNumber}/pdf")
    public ResponseEntity<byte[]> downloadReceiptByNumber(
            @PathVariable String receiptNumber,
            @RequestParam(required = false) String preparedBy,
            Principal principal) {
        byte[] pdf = bookingService.generateReceiptByNumberPdf(receiptNumber, preparedBy, principal != null ? principal.getName() : null);
        return buildPdfResponse(pdf, receiptNumber + ".pdf");
    }

    @GetMapping("/{bookingId}/cancellation-receipt-pdf")
    public ResponseEntity<byte[]> downloadCancellationReceiptPdf(
            @PathVariable Long bookingId,
            @RequestParam(required = false) String preparedBy,
            Principal principal) {
        byte[] pdf = bookingService.generateCancellationSlipPdf(bookingId, preparedBy, principal != null ? principal.getName() : null);
        return buildPdfResponse(pdf, "Cancellation_Slip_" + bookingId + ".pdf");
    }

    private ResponseEntity<byte[]> buildPdfResponse(byte[] pdf, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(pdf);
    }
}