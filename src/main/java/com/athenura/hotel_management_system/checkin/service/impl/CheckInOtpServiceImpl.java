package com.athenura.hotel_management_system.checkin.service.impl;

import com.athenura.hotel_management_system.booking.entity.Booking;
import com.athenura.hotel_management_system.booking.enums.BookingStatus;
import com.athenura.hotel_management_system.booking.repository.BookingRepository;
import com.athenura.hotel_management_system.checkin.service.CheckInOtpService;
import com.athenura.hotel_management_system.common.exception.*;
import com.athenura.hotel_management_system.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class CheckInOtpServiceImpl implements CheckInOtpService {

    private final BookingRepository bookingRepository;
    private final EmailService emailService;
    private final StringRedisTemplate redisTemplate;

    private static final String OTP_KEY_PREFIX = "checkin:otp:";
    private static final Duration OTP_EXPIRY = Duration.ofMinutes(5);

    @Override
    public String generateOtp() {

        return String.valueOf(
                ThreadLocalRandom.current()
                        .nextInt(100000, 1000000)
        );
    }

    @Override
    public void sendOtp(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new BookingNotFoundException("Booking not found")
                );

        if (booking.getBookingStatus() != BookingStatus.BOOKED) {
            throw new InvalidBookingStatusException(
                    "OTP can only be sent for a booked reservation"
            );
        }

        String otp = generateOtp();

        String redisKey = OTP_KEY_PREFIX + bookingId;

        redisTemplate.opsForValue().set(
                redisKey,
                otp,
                OTP_EXPIRY
        );

        emailService.sendCheckInOtp(booking, otp);
    }

    @Override
    public void verifyOtp(Long bookingId, String otp) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new BookingNotFoundException("Booking not found")
                );

        if (booking.getBookingStatus() != BookingStatus.BOOKED) {
            throw new InvalidBookingStatusException(
                    "Booking is not available for check-in"
            );
        }

        // Check-in date validation
        LocalDate today = LocalDate.now();

        if (today.isBefore(booking.getCheckInDate())) {
            throw new CheckInDateException(
                    "Check-in date has not arrived yet"
            );
        }

        if (today.isAfter(booking.getCheckInDate())) {
            throw new CheckInDateException("Check-in date has already passed");
        }

        // Get OTP from Redis
        String redisKey = OTP_KEY_PREFIX + bookingId;

        String storedOtp = redisTemplate.opsForValue()
                .get(redisKey);

        if (storedOtp == null) {
            throw new OtpExpiredException(
                    "OTP has expired or was not generated"
            );
        }

        // Verify OTP
        if (!storedOtp.equals(otp)) {
            throw new InvalidOtpException("Invalid OTP");
        }

        // Check-in successful
        booking.setBookingStatus(BookingStatus.CHECKED_IN);

        bookingRepository.save(booking);

        // OTP can be used only once
        redisTemplate.delete(redisKey);
    }
}