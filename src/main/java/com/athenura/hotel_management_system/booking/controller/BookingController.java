package com.athenura.hotel_management_system.booking.controller;

import com.athenura.hotel_management_system.booking.dto.BookingRequest;
import com.athenura.hotel_management_system.booking.dto.BookingResponse;
import com.athenura.hotel_management_system.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/booking")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // Create Booking
    @PostMapping("/create")
    public ResponseEntity<BookingResponse> createBooking(
            @RequestBody BookingRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(request));
    }

    // Update Booking
    @PatchMapping("/update/{id}")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable Long id,
            @RequestBody BookingRequest request) {

        return ResponseEntity.ok(
                bookingService.updateBooking(id, request)
        );
    }

    // Get Booking By ID
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                bookingService.getBookingById(id)
        );
    }

    // Get All Bookings
    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {

        return ResponseEntity.ok(
                bookingService.getAllBookings()
        );
    }

    // Cancel Booking
    @PatchMapping("/cancel/{id}")
    public ResponseEntity<String> cancelBooking(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                bookingService.cancelBooking(id)
        );
    }
}