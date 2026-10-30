package com.athenura.hotel_management_system.payment.entity;

import com.athenura.hotel_management_system.booking.entity.Booking;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;


    @Column(name = "taxable_amount", precision = 10, scale = 2)
    private BigDecimal taxableAmount;

    @Builder.Default
    @Column(name = "tax_rate", precision = 5, scale = 2)
    private BigDecimal taxRate = new BigDecimal("18.00"); //18% gst

    @Column(name = "tax_amount", precision = 10, scale =2)
    private BigDecimal taxAmount;

    @Column(name ="total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Builder.Default
    @Column(name = "balance_due", precision = 10, scale =2)
    private BigDecimal balanceDue = BigDecimal.ZERO;

    @Column(nullable = false)
    private String paymentType; //full, split_advance, split_balance

    @Column(nullable = false)
    private String paymentMethod; //Cash, Upi, Card

    @Column(nullable = false)
    private String paymentStatus; //success, pending failed

    @Column(nullable = false, unique = true)
    private String receiptNumber;

    @Column(name = "payment_date", nullable = false)
    private LocalDateTime paymentDate;

    @Column(name = "transaction_reference")
    private String transactionReference;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "razorpay_order_id")
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id")
    private String razorpayPaymentId;


    @Column(name = "settled_items", length = 1000)
    private String settledItems;


    @Column(precision = 10, scale = 2)

    private BigDecimal grossAmount;



    @Column(precision = 10, scale = 2)

    private BigDecimal discountDeducted;



    @Column(precision = 10, scale = 2)

    private BigDecimal couponDeducted;



    @Column(precision = 10, scale = 2)

    private BigDecimal amountPaid;



    @Column(precision = 10, scale = 2)

    private BigDecimal balanceRemaining;


}
