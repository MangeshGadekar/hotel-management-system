package com.athenura.hotel_management_system.payment.mapper;

import com.athenura.hotel_management_system.booking.entity.Booking;
import com.athenura.hotel_management_system.payment.dto.PaymentDTO;
import com.athenura.hotel_management_system.payment.entity.Payment;
import lombok.Builder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Builder
@Component
public class PaymentMapper {
    public PaymentDTO.ReceiptResponse toReceiptResponse(
            Payment payment,
            Booking booking,
            BigDecimal totalPaidSoFar,
            BigDecimal remainingBalance,
            String receiptType
    ){
        return PaymentDTO.ReceiptResponse.builder()
                .receiptNumber(payment.getReceiptNumber())
                .bookingId(booking.getId())
                .guestName(booking.getGuest().getFirstName() + " " + booking.getGuest().getLastName())
                .roomNumber(booking.getRoom().getRoomNumber())
                .totalBookingAmount(booking.getTotalAmount())
                .amountPaid(payment.getAmount())
                .totalPaidSoFar(totalPaidSoFar)
                .remainingBalance(remainingBalance.compareTo(BigDecimal.ZERO)<0 ? BigDecimal.ZERO : remainingBalance)
                .paymentType(payment.getPaymentType())
                .paymentMethod(payment.getPaymentMethod())
                .receiptType(receiptType)
                .transactionTime(payment.getPaymentDate())
                .build();
    }
}
