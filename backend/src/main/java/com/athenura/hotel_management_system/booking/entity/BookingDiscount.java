package com.athenura.hotel_management_system.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking_discount")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDiscount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "discount_source", nullable = false)
    private String discountSource; // "COUPON" or "DESK_CONCESSION"

    @Column(name = "discount_type", nullable = false)
    private String discountType;   // "FLAT" or "PERCENT"

    @Column(name = "discount_value", nullable = false)
    private BigDecimal discountValue;

    @Column(name = "calculated_amount", nullable = false)
    private BigDecimal calculatedAmount;

    @Column(name = "reason")
    private String reason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Column(name = "receipt_number", length = 64)
    private String receiptNumber;
}