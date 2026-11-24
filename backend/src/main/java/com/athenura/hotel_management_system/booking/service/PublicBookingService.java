package com.athenura.hotel_management_system.booking.service;

import com.athenura.hotel_management_system.booking.dto.BookingResponse;
import com.athenura.hotel_management_system.booking.dto.GuestBookingRequest;
import com.athenura.hotel_management_system.booking.dto.GuestBookingResponse;
import com.athenura.hotel_management_system.payment.dto.PaymentDTO;
import com.athenura.hotel_management_system.room.entity.Room;

import java.time.LocalDate;
import java.util.List;

public interface PublicBookingService {

    GuestBookingResponse createPublicBookingOrder(GuestBookingRequest req);

    PaymentDTO.ReceiptResponse verifyPublicBookingPayment(PaymentDTO.RazorpayVerifyRequest request);

    List<Room> searchAvailableRooms(LocalDate checkIn, LocalDate checkOut, Integer guests);

    void sendManageBookingOtp(String bookingIdentifier, String email);

    BookingResponse verifyManageBookingOtp(String bookingIdentifier, String email, String otp);

    void validateGuestBookingOwnership(Long bookingId, String email);
}