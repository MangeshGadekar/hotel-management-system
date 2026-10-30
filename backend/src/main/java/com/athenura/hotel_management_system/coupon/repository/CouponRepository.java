package com.athenura.hotel_management_system.coupon.repository;

import com.athenura.hotel_management_system.coupon.entity.Coupon;
import com.athenura.hotel_management_system.coupon.enums.CouponAudience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    @Query("""
        SELECT c FROM Coupon c
        WHERE c.active = true
          AND (c.validFrom IS NULL OR c.validFrom <= :today)
          AND (c.validUntil IS NULL OR c.validUntil >= :today)
          AND (c.usageLimit IS NULL OR c.timesUsed < c.usageLimit)
    """)
    List<Coupon> findAllActive(@Param("today") LocalDate today);

    @Query("""
        SELECT c FROM Coupon c
        WHERE c.active = true
          AND c.targetAudience IN (:audiences)
          AND (c.validFrom IS NULL OR c.validFrom <= :today)
          AND (c.validUntil IS NULL OR c.validUntil >= :today)
          AND (c.usageLimit IS NULL OR c.timesUsed < c.usageLimit)
    """)
    List<Coupon> findActiveByAudiences(
            @Param("audiences") List<CouponAudience> audiences,
            @Param("today") LocalDate today
    );
}