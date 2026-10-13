package com.athenura.hotel_management_system.booking.service;

import com.athenura.hotel_management_system.booking.dto.BookingRequest;
import com.athenura.hotel_management_system.booking.dto.BookingResponse;
import com.athenura.hotel_management_system.booking.dto.CustomServiceRequest;

import java.util.List;

public interface BookingService {

    BookingResponse createBooking(BookingRequest request);

    BookingResponse updateBooking(Long id, BookingRequest request);

    BookingResponse getBookingById(Long id);

    List<BookingResponse> getAllBookings();

    String cancelBooking(Long id);
    BookingResponse checkInGuest(Long bookingId);
    BookingResponse checkOutGuest(Long bookingId);

    BookingResponse addExtraServicesToBooking(Long bookingId, List<Long> extraServiceIds);

    BookingResponse addCustomServiceToBooking(Long bookingId, CustomServiceRequest request);

    BookingResponse removeExtraServiceFromBooking(Long bookingId, Long extraServiceId);

}