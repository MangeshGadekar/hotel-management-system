package com.athenura.hotel_management_system.notification.service.impl;

import com.athenura.hotel_management_system.booking.entity.Booking;
import com.athenura.hotel_management_system.notification.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Base64;
import java.util.HashMap;
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
        sendBookingConfirmationWithReceipt(booking, null);
    }

    @Override
    public void sendBookingConfirmationWithReceipt(Booking booking, byte[] pdfBytes) {
        String guestName = booking.getGuest().getFirstName() + " " + booking.getGuest().getLastName();

        String roomNum = booking.getRoom() != null ? booking.getRoom().getRoomNumber() : "-";
        String roomType = booking.getRoom() != null && booking.getRoom().getRoomType() != null
                ? booking.getRoom().getRoomType().name()
                : "Standard";

        String htmlContent = """
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #D96B43;">Hotel Aatithya - Check-In Invoice & Key Slip</h2>

                    <p>Hello <b>%s</b>,</p>

                    <p>Your hotel check-in has been successfully completed!</p>

                    <div style="background-color: #faf5f2; border-left: 4px solid #D96B43; padding: 12px; margin: 15px 0;">
                        <b>Booking ID:</b> #%d<br>
                        <b>Room Number:</b> %s (%s)<br>
                        <b>Check-in:</b> %s<br>
                        <b>Check-out:</b> %s<br>
                        <b>Total Amount:</b> ₹%s<br>
                        <b>Balance Due:</b> ₹%s
                    </div>

                    <p>Please find your official <b>Check-In Receipt & Key Pass</b> attached as a PDF to this email.</p>

                    <p>Thank you for choosing Hotel Aatithya. We wish you a delightful stay!</p>
                </body>
                </html>
                """.formatted(
                guestName,
                booking.getId(),
                roomNum,
                roomType,
                booking.getCheckInDate(),
                booking.getCheckOutDate(),
                booking.getTotalAmount(),
                booking.getBalanceDue() != null ? booking.getBalanceDue() : 0
        );

        List<Map<String, String>> attachments = null;
        if (pdfBytes != null && pdfBytes.length > 0) {
            String base64Content = Base64.getEncoder().encodeToString(pdfBytes);
            attachments = List.of(
                    Map.of(
                            "name", "CheckIn_Receipt_INV-" + booking.getId() + ".pdf",
                            "content", base64Content
                    )
            );
        }

        sendEmailViaBrevo(
                booking.getGuest().getEmail(),
                guestName,
                "Check-In Receipt & Key Slip - Booking #" + booking.getId(),
                htmlContent,
                attachments
        );
    }

    @Override
    public void sendCheckInOtp(Booking booking, String otp) {
        String guestName = booking.getGuest().getFirstName() + " " + booking.getGuest().getLastName();

        String htmlContent = """
            <html>
            <body>
                <h2>Hotel Check-in Verification</h2>

                <p>Hello <b>%s</b>,</p>

                <p>Your OTP for hotel check-in is:</p>

                <h1>%s</h1>

                <p>This OTP is valid for <b>5 minutes</b>.</p>

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

        sendEmailViaBrevo(
                booking.getGuest().getEmail(),
                guestName,
                "Hotel Check-in OTP - Booking #" + booking.getId(),
                htmlContent,
                null
        );
    }

    @Override
    public void sendCampaignEmail(String recipientEmail, String recipientName, String subject, String content) {
        String htmlContent = """
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2>Hotel Aatithya</h2>
                <p>%s</p>
                <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;">
                <p style="font-size: 12px; color: #888;">You are receiving this email as a valued guest of Hotel Aatithya.</p>
            </body>
            </html>
            """.formatted(content.replace("\n", "<br>"));

        try {
            sendEmailViaBrevo(recipientEmail, recipientName, subject, htmlContent, null);
        } catch (Exception e) {
            throw new RuntimeException("Brevo email dispatch failed for " + recipientEmail + ": " + e.getMessage(), e);
        }
    }

    @Override
    public void sendReceptionistCredentials(String toEmail, String rawPassword, String firstName) {
        String recipientName = (firstName != null && !firstName.isBlank()) ? firstName : "User";

        String htmlContent = """
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2>Account Created - Hotel Management System</h2>
                <p>Hello <b>%s</b>,</p>
                <p>Your Receptionist account has been created successfully by Admin.</p>
                
                <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p style="margin: 0;"><b>Login Credentials:</b></p>
                    <p style="margin: 5px 0;"><b>Email:</b> %s</p>
                    <p style="margin: 5px 0;"><b>Password / Secret Key:</b> %s</p>
                </div>
                
                <p>Please login using these credentials and complete your registration or update your password.</p>
                <br>
                <p>Best Regards,<br><b>Hotel Management Team</b></p>
            </body>
            </html>
            """.formatted(recipientName, toEmail, rawPassword);

        try {
            sendEmailViaBrevo(toEmail, recipientName, "Account Created - Hotel Management System", htmlContent, null);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send Receptionist credentials to " + toEmail + ": " + e.getMessage(), e);
        }
    }

    private void sendEmailViaBrevo(
            String recipientEmail,
            String recipientName,
            String subject,
            String htmlContent,
            List<Map<String, String>> attachments) {

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("sender", Map.of(
                "name", senderName,
                "email", senderEmail
        ));
        requestBody.put("to", List.of(
                Map.of(
                        "name", recipientName,
                        "email", recipientEmail
                )
        ));
        requestBody.put("subject", subject);
        requestBody.put("htmlContent", htmlContent);

        if (attachments != null && !attachments.isEmpty()) {
            requestBody.put("attachment", attachments);
        }

        restClient.post()
                .uri("https://api.brevo.com/v3/smtp/email")
                .contentType(MediaType.APPLICATION_JSON)
                .header("api-key", apiKey)
                .body(requestBody)
                .retrieve()
                .toBodilessEntity();
    }
}