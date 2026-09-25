package com.athenura.hotel_management_system.amenity.dto;

import com.athenura.hotel_management_system.amenity.enums.AmenityPriceType;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AmenityResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private AmenityPriceType priceType;
    private boolean active;
    private String icon;
    private Instant createdAt;
    private Instant updatedAt;
}
