package com.athenura.hotel_management_system.notification.service;

import com.athenura.hotel_management_system.booking.entity.Booking;

public interface EmailService {
    void sendBookingConfirmation(Booking booking);

    void sendCheckInOtp(Booking booking, String otp);
}
