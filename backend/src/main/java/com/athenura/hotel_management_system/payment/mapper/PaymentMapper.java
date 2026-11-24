package com.athenura.hotel_management_system.payment.mapper;

import com.athenura.hotel_management_system.booking.entity.Booking;
import com.athenura.hotel_management_system.payment.dto.PaymentDTO;
import com.athenura.hotel_management_system.payment.entity.Payment;
import com.athenura.hotel_management_system.room.entity.Room;
import lombok.Builder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

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
        List<Room> activeRooms = (booking.getRooms() != null && !booking.getRooms().isEmpty())
                ? booking.getRooms()
                : (booking.getRoom() != null ? List.of(booking.getRoom()) : List.of());

        String roomDisplay = activeRooms.isEmpty()
                ? "—"
                : activeRooms.stream().map(Room::getRoomNumber).collect(Collectors.joining(", "));

        return PaymentDTO.ReceiptResponse.builder()
                .receiptNumber(payment.getReceiptNumber())
                .bookingId(booking.getId())
                .guestName(booking.getGuest() != null
                        ? (booking.getGuest().getFirstName() + " " + booking.getGuest().getLastName()).trim()
                        : "Guest")
                .roomNumber(roomDisplay)
                .totalBookingAmount(booking.getTotalAmount())
                .amountPaid(payment.getAmount())
                .totalPaidSoFar(totalPaidSoFar)
                .remainingBalance(remainingBalance.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : remainingBalance)
                .paymentType(payment.getPaymentType())
                .paymentMethod(payment.getPaymentMethod())
                .transactionReference(payment.getTransactionReference())
                .receiptType(receiptType)
                .settledItems(payment.getSettledItems())
                .transactionTime(payment.getPaymentDate())
                .grossAmount(payment.getGrossAmount() != null ? payment.getGrossAmount() : payment.getAmount())
                .discountDeducted(payment.getDiscountDeducted() != null ? payment.getDiscountDeducted() : BigDecimal.ZERO)
                .couponDeducted(payment.getCouponDeducted() != null ? payment.getCouponDeducted() : BigDecimal.ZERO)
                .balanceRemaining(payment.getBalanceRemaining() != null ? payment.getBalanceRemaining() : remainingBalance)
                .build();
    }
}