package com.athenura.hotel_management_system.checkin.service;

public interface CheckInOtpService {

    String generateOtp();

    void sendOtp(Long bookingId);

    void verifyOtp(Long bookingId, String otp);
}