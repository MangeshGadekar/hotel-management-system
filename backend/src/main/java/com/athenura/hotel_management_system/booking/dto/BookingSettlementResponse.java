package com.athenura.hotel_management_system.booking.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingSettlementResponse {
    private Long bookingId;
    private BigDecimal totalBill;
    private BigDecimal totalPaid;
    private BigDecimal balanceDue;
    private BigDecimal discountAmount;
    private BigDecimal pendingRoomBalance;
    private List<SettlementItemDto> pendingItems;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SettlementItemDto {
        private Long serviceId;
        private String name;
        private BigDecimal basePrice;
        private BigDecimal taxRate;
        private BigDecimal taxAmount;
        private BigDecimal totalCost;
    }
}