package com.athenura.hotel_management_system.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentDTO {


    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentRequest{
        private Long bookingId;
        private String paymentType; //full, split_advance, split_Balance
        private String paymentMethod;// cash,upi,card
        private BigDecimal amount; // custom amount can be entered
    }


    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReceiptResponse{
        private String receiptNumber;
        private Long bookingId;
        private String guestName;
        private String roomNumber;
        private BigDecimal totalBookingAmount;
        private BigDecimal amountPaid;
        private BigDecimal totalPaidSoFar;
        private BigDecimal remainingBalance;
        private String  paymentType;
        private String paymentMethod;
        private String receiptType;      // full_payment_receipt / advance_payment_receipt
        private LocalDateTime transactionTime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RazorpayOrderResponse{
        private String orderId;
        private BigDecimal amount;
        private String currency;
        private String keyId;
        private Long bookingId;
        private String paymentType;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RazorpayVerifyRequest {
        private Long bookingId;
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;
        private String paymentType;
    }
}
