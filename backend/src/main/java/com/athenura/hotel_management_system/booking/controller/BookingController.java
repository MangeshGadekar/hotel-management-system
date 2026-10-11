package com.athenura.hotel_management_system.booking.controller;

import com.athenura.hotel_management_system.booking.dto.BookingRequest;
import com.athenura.hotel_management_system.booking.dto.BookingResponse;
import com.athenura.hotel_management_system.booking.entity.Booking;
import com.athenura.hotel_management_system.booking.mapper.BookingMapper;
import com.athenura.hotel_management_system.booking.repository.BookingRepository;
import com.athenura.hotel_management_system.booking.service.BookingService;
import com.athenura.hotel_management_system.booking.service.CheckInReceiptPdfService;
import com.athenura.hotel_management_system.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.athenura.hotel_management_system.booking.dto.CustomServiceRequest;

import java.util.List;


@Slf4j
@RestController
@RequestMapping("/booking")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;
    private final CheckInReceiptPdfService receiptPdfService;
    private final EmailService emailService;


    @PostMapping("/create")
    public ResponseEntity<BookingResponse> createBooking(
            @RequestBody BookingRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(request));
    }

    @PatchMapping("/update/{id}")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable Long id,
            @RequestBody BookingRequest request) {

        return ResponseEntity.ok(
                bookingService.updateBooking(id, request)
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                bookingService.getBookingById(id)
        );
    }


    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {

        return ResponseEntity.ok(
                bookingService.getAllBookings()
        );
    }


    @PatchMapping("/cancel/{id}")
    public ResponseEntity<String> cancelBooking(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                bookingService.cancelBooking(id)
        );
    }

    @PatchMapping("/{id}/check-in")
    public ResponseEntity<BookingResponse> checkInGuest(@PathVariable Long id) {
        BookingResponse response = bookingService.checkInGuest(id);

        try {
            Booking booking = bookingRepository.findById(id).orElse(null);
            if (booking != null) {
                byte[] pdfBytes = receiptPdfService.generateCheckInReceipt(booking);
                emailService.sendBookingConfirmationWithReceipt(booking, pdfBytes);
            }
        } catch (Exception e) {
            log.error("Receipt generation or email delivery failed for booking #{}: {}", id, e.getMessage());
        }

        return ResponseEntity.ok(response);
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


    @GetMapping("/{id}/receipt-pdf")
    public ResponseEntity<byte[]> downloadCheckInReceiptPdf(@PathVariable Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));

        byte[] pdfBytes = receiptPdfService.generateCheckInReceipt(booking);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=CheckIn_Receipt_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}