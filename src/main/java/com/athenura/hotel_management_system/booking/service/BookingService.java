package com.athenura.hotel_management_system.booking.service;

import com.athenura.hotel_management_system.booking.dto.BookingRequest;
import com.athenura.hotel_management_system.booking.dto.BookingResponse;

import java.util.List;

public interface BookingService {

    BookingResponse createBooking(BookingRequest request);

    BookingResponse updateBooking(Long id, BookingRequest request);

    BookingResponse getBookingById(Long id);

    List<BookingResponse> getAllBookings();

    String cancelBooking(Long id);

    // Guest साठी स्वतःच्या बुकिंग्स मिळवण्याची पद्धत
    List<BookingResponse> getBookingsByUserEmail(String email);
}