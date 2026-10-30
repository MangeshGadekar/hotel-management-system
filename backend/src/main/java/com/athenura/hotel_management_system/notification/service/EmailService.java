package com.athenura.hotel_management_system.notification.service;

import com.athenura.hotel_management_system.booking.entity.Booking;
import com.athenura.hotel_management_system.payment.entity.Payment;

import java.math.BigDecimal;

public interface EmailService {

    void sendOnlineBookingWithPaymentSummary(Booking booking, Payment payment);
    void sendBookingConfirmationWithReceipt(Booking booking, byte[] pdfBytes);
    void sendServiceSettlementReceipt(Booking booking, Payment payment, byte[] servicePdf);
    void sendRefundNotificationWithPdf(Booking booking, BigDecimal refundAmount, String refundId, byte[] refundPdf);
    void sendCampaignEmail(String recipientEmail, String recipientName, String subject, String content);
    void sendReceptionistCredentials(String toEmail, String rawPassword, String firstName);
    void sendGuestRegistrationOtp(String toEmail, String otp);
    void sendTransactionalEmail(String toEmail, String toName, String subject, String htmlContent);
    void sendManageBookingAccessOtp(Booking booking, String otp);
}