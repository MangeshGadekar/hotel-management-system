package com.athenura.hotel_management_system.payment.service;


import com.athenura.hotel_management_system.payment.dto.PaymentDTO;
import com.athenura.hotel_management_system.payment.entity.Payment;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public interface PaymentService {
    PaymentDTO.ReceiptResponse processPayment(PaymentDTO.PaymentRequest request);

    PaymentDTO.ReceiptResponse getReceiptByNumber(String receiptNumber);
    List<PaymentDTO.ReceiptResponse> getPaymentsByBookingId(Long bookingId);

    PaymentDTO.RazorpayOrderResponse createRazorpayOrder(Long bookingId, String paymentType);
    PaymentDTO.ReceiptResponse verifyRazorpayPayment(PaymentDTO.RazorpayVerifyRequest request);
}
