package com.athenura.hotel_management_system.notification.service.impl;

import com.athenura.hotel_management_system.booking.entity.Booking;
import com.athenura.hotel_management_system.notification.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class EmailServiceImpl implements EmailService {

    @Value("${brevo.api.key}")
    private String apiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    @Value("${brevo.sender.name}")
    private String senderName;

    private final RestClient restClient;

    public EmailServiceImpl(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    @Override
    public void sendBookingConfirmation(Booking booking) {

        String guestName =
                booking.getGuest().getFirstName() + " " +
                        booking.getGuest().getLastName();

        String htmlContent = """
                <html>
                <body>
                    <h2>Booking Confirmed!</h2>

                    <p>Hello <b>%s</b>,</p>

                    <p>Your hotel booking has been successfully confirmed.</p>

                    <p>
                        <b>Booking ID:</b> %d<br>
                        <b>Room Number:</b> %s<br>
                        <b>Check-in:</b> %s<br>
                        <b>Check-out:</b> %s<br>
                        <b>Total Amount:</b> ₹%s
                    </p>

                    <p>Thank you for choosing our hotel!</p>
                </body>
                </html>
                """.formatted(
                guestName,
                booking.getId(),
                booking.getRoom().getRoomNumber(),
                booking.getCheckInDate(),
                booking.getCheckOutDate(),
                booking.getTotalAmount()
        );

        Map<String, Object> requestBody = Map.of(
                "sender", Map.of(
                        "name", senderName,
                        "email", senderEmail
                ),
                "to", List.of(
                        Map.of(
                                "name", guestName,
                                "email", booking.getGuest().getEmail()
                        )
                ),
                "subject", "Booking Confirmation - #" + booking.getId(),
                "htmlContent", htmlContent
        );

        restClient.post()
                .uri("https://api.brevo.com/v3/smtp/email")
                .contentType(MediaType.APPLICATION_JSON)
                .header("api-key", apiKey)
                .body(requestBody)
                .retrieve()
                .toBodilessEntity();
    }

    @Override
    public void sendCheckInOtp(Booking booking, String otp) {

        String guestName =
                booking.getGuest().getFirstName() + " " +
                        booking.getGuest().getLastName();

        String htmlContent = """
            <html>
            <body>
                <h2>Hotel Check-in Verification</h2>

                <p>Hello <b>%s</b>,</p>

                <p>Your OTP for hotel check-in is:</p>

                <h1>%s</h1>

                <p>
                    This OTP is valid for <b>5 minutes</b>.
                </p>

                <p>
                    <b>Booking ID:</b> %d<br>
                    <b>Room Number:</b> %s
                </p>

                <p>If you did not request this OTP, please ignore this email.</p>
            </body>
            </html>
            """.formatted(
                guestName,
                otp,
                booking.getId(),
                booking.getRoom().getRoomNumber()
        );

        Map<String, Object> requestBody = Map.of(
                "sender", Map.of(
                        "name", senderName,
                        "email", senderEmail
                ),
                "to", List.of(
                        Map.of(
                                "name", guestName,
                                "email", booking.getGuest().getEmail()
                        )
                ),
                "subject", "Hotel Check-in OTP - Booking #" + booking.getId(),
                "htmlContent", htmlContent
        );

        restClient.post()
                .uri("https://api.brevo.com/v3/smtp/email")

                .contentType(MediaType.APPLICATION_JSON)
                .header("api-key", apiKey)
                .body(requestBody)
                .retrieve()
                .toBodilessEntity();
    }

}
