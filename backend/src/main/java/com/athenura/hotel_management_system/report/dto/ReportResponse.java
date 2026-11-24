package com.athenura.hotel_management_system.report.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {

    private LocalDate from;
    private LocalDate to;

    private Long receptionistId;
    private String receptionistName;

    private Summary summary;
    private List<ReceptionistRow> byReceptionist;
    private List<DailyRow> daily;
    private List<BookingRow> bookings;

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Summary {
        private long totalBookings;
        private long cancelledBookings;
        private BigDecimal totalAmount;
        private BigDecimal totalPaid;
        private BigDecimal totalBalance;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ReceptionistRow {
        private Long receptionistId;
        private String receptionistName;
        private long bookings;
        private long cancelled;
        private BigDecimal totalAmount;
        private BigDecimal totalPaid;
        private BigDecimal totalBalance;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DailyRow {
        private LocalDate date;
        private long bookings;
        private BigDecimal totalAmount;
        private BigDecimal totalPaid;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class BookingRow {
        private Long bookingId;
        private String bookingReference;
        private String guestName;
        private String guestPhone;
        private String rooms;
        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private String status;
        private Long receptionistId;
        private String receptionistName;
        private BigDecimal totalAmount;
        private BigDecimal totalPaid;
        private BigDecimal balanceDue;
        private LocalDateTime bookedAt;
    }
}