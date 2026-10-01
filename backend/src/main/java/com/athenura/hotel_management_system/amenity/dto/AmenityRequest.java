package com.athenura.hotel_management_system.amenity.dto;

import com.athenura.hotel_management_system.amenity.enums.AmenityPriceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AmenityRequest {

    @NotBlank(message = "Amenity name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    private BigDecimal price;

    private AmenityPriceType priceType;

    private Boolean active;

    private String icon;
}
