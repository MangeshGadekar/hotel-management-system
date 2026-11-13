package com.athenura.hotel_management_system.payment.service;

import com.athenura.hotel_management_system.payment.dto.PaymentDTO;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public interface PaymentService {

    List<PaymentDTO.ReceiptResponse> getAllPayments();
    PaymentDTO.ReceiptResponse processPayment(PaymentDTO.PaymentRequest request);

    PaymentDTO.ReceiptResponse getReceiptByNumber(String receiptNumber);
    List<PaymentDTO.ReceiptResponse> getPaymentsByBookingId(Long bookingId);

    PaymentDTO.RazorpayOrderResponse createRazorpayOrder(Long bookingId, String paymentType);
    PaymentDTO.ReceiptResponse verifyRazorpayPayment(PaymentDTO.RazorpayVerifyRequest request);
    void processRefundForBooking(Long bookingId);

    void processRefundForBookingWithPolicy(Long bookingId, BigDecimal refundRatio);
}