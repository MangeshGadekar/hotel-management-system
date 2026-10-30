package com.athenura.hotel_management_system.coupon.entity;


import com.athenura.hotel_management_system.coupon.enums.CouponAudience;
import com.athenura.hotel_management_system.coupon.enums.DiscountType;
import com.athenura.hotel_management_system.room.enums.RoomType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;
    @Column(name = "min_booking_amount", precision = 10, scale= 2)
    private BigDecimal minBookingAmount;

    @Column(name = "valid_from", nullable = false)
    private LocalDate validFrom;

    @Column(name= "valid_until")
    private LocalDate validUntil;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Builder.Default
    @Column(name = "times_used")
    private Integer timesUsed = 0;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ElementCollection(targetClass = RoomType.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "coupon_applicable_room_types", joinColumns = @JoinColumn(name = "coupon_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "room_type")
    @Builder.Default
    private Set<RoomType> applicableRoomTypes = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "target_audience", nullable = false)
    @Builder.Default
    private CouponAudience targetAudience = CouponAudience.ALL;

}
