package com.athenura.hotel_management_system.notification.service.impl;

import com.athenura.hotel_management_system.booking.entity.Booking;
import com.athenura.hotel_management_system.notification.service.EmailService;
import com.athenura.hotel_management_system.payment.entity.Payment;
import com.athenura.hotel_management_system.room.entity.Room;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class EmailServiceImpl implements EmailService {

    @Value("${brevo.api.key}")
    private String apiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    @Value("${brevo.sender.name:Hotel Athitya}")
    private String senderName;

    private final RestClient restClient;

    public EmailServiceImpl(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    private String getRoomDisplay(Booking booking) {
        if (booking == null) return "—";
        if (booking.getRooms() != null && !booking.getRooms().isEmpty()) {
            return booking.getRooms().stream()
                    .map(Room::getRoomNumber)
                    .collect(Collectors.joining(", "));
        }
        return booking.getRoom() != null ? booking.getRoom().getRoomNumber() : "—";
    }

    private String resolveGuestName(Booking booking) {
        if (booking == null || booking.getGuest() == null) return "Valued Guest";
        String first = booking.getGuest().getFirstName() != null ? booking.getGuest().getFirstName() : "";
        String last = booking.getGuest().getLastName() != null ? booking.getGuest().getLastName() : "";
        String full = (first + " " + last).trim();
        return !full.isEmpty() ? full : "Valued Guest";
    }

    // 1. Online Guest Booking
    @Override
    public void sendOnlineBookingWithPaymentSummary(Booking booking, Payment payment) {
        if (booking == null || booking.getGuest() == null || booking.getGuest().getEmail() == null) return;

        String guestName = resolveGuestName(booking);
        String roomNumber = getRoomDisplay(booking);
        String roomType = (booking.getRoom() != null && booking.getRoom().getRoomType() != null)
                ? booking.getRoom().getRoomType().name() : "DELUXE";

        BigDecimal paidAmount = payment != null && payment.getAmountPaid() != null ? payment.getAmountPaid()
                : (booking.getAdvancePayment() != null ? booking.getAdvancePayment() : BigDecimal.ZERO);
        BigDecimal balanceDue = booking.getBalanceDue() != null ? booking.getBalanceDue() : BigDecimal.ZERO;
        String channel = payment != null && payment.getPaymentMethod() != null ? payment.getPaymentMethod().replace("_", " ") : "UPI / Net Banking";
        String txnRef = payment != null && payment.getTransactionReference() != null ? payment.getTransactionReference() : ("TXN-" + booking.getId());

        String statusBadge = balanceDue.compareTo(BigDecimal.ZERO) <= 0
                ? "<span style='color: #16a34a; font-weight: bold;'>Fully Settled</span>"
                : "<span style='color: #ea580c; font-weight: bold;'>Partially Paid (₹" + balanceDue + " due at desk)</span>";

        String htmlContent = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
                <h2 style="color: #D96B43; margin-top: 0;">Hotel Athitya</h2>
                <p style="font-size: 15px; margin-bottom: 20px;">Reservation Confirmation & Payment Receipt</p>
                <p>Dear <b>%s</b>,</p>
                <p>Thank you for choosing Hotel Athitya! Your booking has been confirmed and payment processed successfully.</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 18px 0;">
                    <h3 style="margin-top: 0; font-size: 14px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">Reservation Details</h3>
                    <p style="margin: 6px 0;"><b>Booking Ref:</b> #%d</p>
                    <p style="margin: 6px 0;"><b>Room:</b> Room %s (%s)</p>
                    <p style="margin: 6px 0;"><b>Check-In:</b> %s (From 2:00 PM)</p>
                    <p style="margin: 6px 0;"><b>Check-Out:</b> %s (Until 12:00 PM)</p>
                    
                    <h3 style="margin-top: 14px; font-size: 14px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">Payment Summary</h3>
                    <p style="margin: 6px 0;"><b>Amount Paid:</b> ₹%s</p>
                    <p style="margin: 6px 0;"><b>Payment Mode:</b> %s</p>
                    <p style="margin: 6px 0;"><b>Transaction ID:</b> %s</p>
                    <p style="margin: 6px 0;"><b>Status:</b> %s</p>
                </div>
                
                <p style="font-size: 13px; color: #64748b;">We look forward to welcoming you!</p>
                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
                <p style="font-size: 11px; color: #94a3b8; margin: 0;">Hotel Athitya Management • athitya@gmail.com</p>
            </div>
            """.formatted(
                guestName,
                booking.getId(),
                roomNumber,
                roomType,
                booking.getCheckInDate(),
                booking.getCheckOutDate(),
                paidAmount,
                channel,
                txnRef,
                statusBadge
        );

        sendEmailViaBrevo(
                booking.getGuest().getEmail(),
                guestName,
                "Booking Confirmed: Room " + roomNumber + " - Hotel Athitya",
                htmlContent,
                null
        );
    }

    // 2. Reception Check-In
    @Override
    public void sendBookingConfirmationWithReceipt(Booking booking, byte[] pdfBytes) {
        if (booking == null || booking.getGuest() == null || booking.getGuest().getEmail() == null) return;

        String guestName = resolveGuestName(booking);
        String roomNumber = getRoomDisplay(booking);
        String roomType = booking.getRoom() != null && booking.getRoom().getRoomType() != null ? booking.getRoom().getRoomType().name() : "DELUXE";
        BigDecimal advancePaid = booking.getAdvancePayment() != null ? booking.getAdvancePayment() : BigDecimal.ZERO;
        BigDecimal balanceDue = booking.getBalanceDue() != null ? booking.getBalanceDue() : BigDecimal.ZERO;

        String htmlContent = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
                <h2 style="color: #D96B43; margin-top: 0;">Hotel Athitya</h2>
                <p style="font-size: 15px; margin-bottom: 20px;">Official Check-In Confirmation & Deposit Receipt</p>
                <p>Dear <b>%s</b>,</p>
                <p>Welcome! You have successfully checked in at Hotel Athitya.</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 18px 0;">
                    <h3 style="margin-top: 0; font-size: 14px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">Check-In Particulars</h3>
                    <p style="margin: 6px 0;"><b>Booking ID:</b> #%d</p>
                    <p style="margin: 6px 0;"><b>Room Assigned:</b> Room %s (%s)</p>
                    <p style="margin: 6px 0;"><b>Stay Window:</b> %s to %s</p>
                    
                    <h3 style="margin-top: 14px; font-size: 14px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">Desk Account Summary</h3>
                    <p style="margin: 6px 0;"><b>Advance Deposit Paid:</b> ₹%s</p>
                    <p style="margin: 6px 0;"><b>Remaining Balance:</b> ₹%s</p>
                </div>
                
                <p>Your signed check-in receipt has been attached as a PDF to this email for your records.</p>
                <p style="font-size: 13px; color: #64748b;">We wish you a pleasant and memorable stay!</p>
            </div>
            """.formatted(
                guestName,
                booking.getId(),
                roomNumber,
                roomType,
                booking.getCheckInDate(),
                booking.getCheckOutDate(),
                advancePaid,
                balanceDue
        );

        List attachments = null;
        if (pdfBytes != null && pdfBytes.length > 0) {
            attachments = List.of(Map.of(
                    "name", "CheckIn_Receipt_" + booking.getId() + ".pdf",
                    "content", Base64.getEncoder().encodeToString(pdfBytes)
            ));
        }

        sendEmailViaBrevo(
                booking.getGuest().getEmail(),
                guestName,
                "Check-In Receipt: Room " + roomNumber + " - Hotel Athitya",
                htmlContent,
                attachments
        );
    }

    // 3. Mid-Stay Service Addition / Settlement
    @Override
    public void sendServiceSettlementReceipt(Booking booking, Payment payment, byte[] servicePdf) {
        if (booking == null || booking.getGuest() == null || booking.getGuest().getEmail() == null) return;

        String guestName = resolveGuestName(booking);
        String serviceItems = payment.getSettledItems() != null ? payment.getSettledItems() : "Extra Service Order";
        BigDecimal amountPaid = payment.getAmountPaid() != null ? payment.getAmountPaid() : payment.getAmount();
        BigDecimal balanceLeft = payment.getBalanceRemaining() != null ? payment.getBalanceRemaining() : BigDecimal.ZERO;

        String htmlContent = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
                <h2 style="color: #D96B43; margin-top: 0;">Hotel Paradise & Suites</h2>
                <p style="font-size: 15px; margin-bottom: 20px;">Room Service / Add-on Payment Receipt</p>
                <p>Dear <b>%s</b>,</p>
                <p>We have processed payment for your room orders and extra services.</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 18px 0;">
                    <p style="margin: 6px 0;"><b>Settled Services:</b> %s</p>
                    <p style="margin: 6px 0;"><b>Amount Collected:</b> ₹%s (%s)</p>
                    <p style="margin: 6px 0;"><b>Receipt Number:</b> %s</p>
                    <p style="margin: 6px 0;"><b>Remaining Room Balance:</b> ₹%s</p>
                </div>
                
                <p>Your itemized service voucher is attached to this email.</p>
            </div>
            """.formatted(
                guestName,
                serviceItems,
                amountPaid,
                payment.getPaymentMethod(),
                payment.getReceiptNumber(),
                balanceLeft
        );

        List attachments = null;
        if (servicePdf != null && servicePdf.length > 0) {
            attachments = List.of(Map.of(
                    "name", "Service_Receipt_" + payment.getReceiptNumber() + ".pdf",
                    "content", Base64.getEncoder().encodeToString(servicePdf)
            ));
        }

        sendEmailViaBrevo(
                booking.getGuest().getEmail(),
                guestName,
                "Service Invoice: " + payment.getReceiptNumber() + " - Hotel Athitya",
                htmlContent,
                attachments
        );
    }

    // 4. Cancellation Refund
    @Override
    public void sendRefundNotificationWithPdf(Booking booking, BigDecimal refundAmount, String refundId, byte[] refundPdf) {
        if (booking == null || booking.getGuest() == null || booking.getGuest().getEmail() == null) return;

        String guestName = resolveGuestName(booking);

        String htmlContent = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
                <h2 style="color: #D96B43; margin-top: 0;">Hotel Athitya</h2>
                <p style="font-size: 15px; margin-bottom: 20px;">Cancellation & Refund Credit</p>
                <p>Dear <b>%s</b>,</p>
                <p>Your reservation <b>#%d</b> has been cancelled. Your refund has been initiated to your original payment channel.</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 18px 0;">
                    <p style="margin: 6px 0;"><b>Refund Amount Credited:</b> <span style="color: #16a34a; font-size: 16px; font-weight: bold;">₹%s</span></p>
                    <p style="margin: 6px 0;"><b>Refund Reference ID:</b> %s</p>
                    <p style="margin: 6px 0;"><b>Booking Status:</b> CANCELLED</p>
                </div>
                
                <p>Please find attached your official Cancellation and Refund Statement.</p>
                <p style="font-size: 13px; color: #64748b;">The funds will reflect in your account within standard bank settlement timelines.</p>
            </div>
            """.formatted(
                guestName,
                booking.getId(),
                refundAmount,
                refundId
        );

        List attachments = null;
        if (refundPdf != null && refundPdf.length > 0) {
            attachments = List.of(Map.of(
                    "name", "Refund_Advice_" + booking.getId() + ".pdf",
                    "content", Base64.getEncoder().encodeToString(refundPdf)
            ));
        }

        sendEmailViaBrevo(
                booking.getGuest().getEmail(),
                guestName,
                "Credit Alert: ₹" + refundAmount + " Refund Processed - Booking #" + booking.getId(),
                htmlContent,
                attachments
        );
    }

    @Override
    public void sendCampaignEmail(String recipientEmail, String recipientName, String subject, String content) {
        String htmlContent = """
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #D96B43;">Hotel Athitya</h2>
                <p>%s</p>
                <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;">
                <p style="font-size: 12px; color: #888;">You are receiving this as a guest of Hotel Athitya.</p>
            </body>
            </html>
            """.formatted(content != null ? content.replace("\n", "<br>") : "");

        sendEmailViaBrevo(recipientEmail, recipientName, subject, htmlContent, null);
    }

    @Override
    public void sendReceptionistCredentials(String toEmail, String rawPassword, String firstName) {
        String recipientName = (firstName != null && !firstName.isBlank()) ? firstName : "Staff Member";

        String htmlContent = """
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #D96B43;">Hotel Athitya</h2>
                <p>Hello <b>%s</b>,</p>
                <p>Your Receptionist account has been configured by the Administrator.</p>
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p style="margin: 4px 0;"><b>Login Email:</b> %s</p>
                    <p style="margin: 4px 0;"><b>Temporary Password:</b> %s</p>
                </div>
                <p>Please log in and update your password upon first access.</p>
            </body>
            </html>
            """.formatted(recipientName, toEmail, rawPassword);

        sendEmailViaBrevo(toEmail, recipientName, "Account Created - Hotel Athitya Staff", htmlContent, null);
    }

    @Override
    public void sendGuestRegistrationOtp(String toEmail, String otp) {
        String htmlContent = """
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #D96B43;">Hotel Athitya</h2>
                <p>Your one-time verification code is:</p>
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 20px; display: inline-block; margin: 10px 0;">
                    <h1 style="color: #D96B43; letter-spacing: 4px; margin: 0; font-family: monospace;">%s</h1>
                </div>
                <p>This code is valid for <b>5 minutes</b>.</p>
            </body>
            </html>
            """.formatted(otp);

        sendEmailViaBrevo(toEmail, "Valued Guest", "Verification Code - Hotel Athitya", htmlContent, null);
    }

    @Override
    public void sendTransactionalEmail(String toEmail, String toName, String subject, String htmlContent) {
        if (toEmail == null || toEmail.isBlank()) return;
        try {
            sendEmailViaBrevo(toEmail, toName, subject, htmlContent, null);
        } catch (Exception e) {
            log.error("Failed to send transactional email: {}", e.getMessage());
        }
    }

    @Override
    public void sendManageBookingAccessOtp(Booking booking, String otp) {
        if (booking == null || booking.getGuest() == null || booking.getGuest().getEmail() == null) return;
        String guestName = resolveGuestName(booking);

        String htmlContent = """
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #D96B43;">Hotel Athitya</h2>
                <p>Hello <b>%s</b>,</p>
                <p>Your access code to view and manage your reservation details is:</p>
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 20px; display: inline-block; margin: 10px 0;">
                    <h1 style="color: #D96B43; letter-spacing: 4px; margin: 0; font-family: monospace;">%s</h1>
                </div>
                <p>This code is valid for <b>10 minutes</b>.</p>
            </body>
            </html>
            """.formatted(guestName, otp);

        sendEmailViaBrevo(booking.getGuest().getEmail(), guestName, "Reservation Access Code - #" + booking.getId(), htmlContent, null);
    }

    private void sendEmailViaBrevo(String recipientEmail, String recipientName, String subject, String htmlContent, List attachments) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("sender", Map.of("name", senderName, "email", senderEmail));
        requestBody.put("to", List.of(Map.of("name", (recipientName != null && !recipientName.isBlank()) ? recipientName : "Valued Guest", "email", recipientEmail)));
        requestBody.put("subject", subject);
        requestBody.put("htmlContent", htmlContent);

        if (attachments != null && !attachments.isEmpty()) {
            requestBody.put("attachment", attachments);
        }

        try {
            restClient.post()
                    .uri("https://api.brevo.com/v3/smtp/email")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("api-key", apiKey)
                    .body(requestBody)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.error("Brevo dispatch failed: {}", e.getMessage());
        }
    }
}