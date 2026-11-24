package com.athenura.hotel_management_system.booking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "checkout_sessions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutSession {

    @Id
    @Column(length = 64)
    private String sessionId;

    @Column(name = "razorpay_order_id", nullable = false)
    private String razorpayOrderId;

    @Lob
    @Column(name = "booking_request_json", columnDefinition = "LONGTEXT", nullable = false)
    private String bookingRequestJson;

    @Column(name = "total_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}