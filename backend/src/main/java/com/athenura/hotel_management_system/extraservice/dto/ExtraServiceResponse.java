package com.athenura.hotel_management_system.extraservice.dto;

import com.athenura.hotel_management_system.extraservice.enums.ServicePriceType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExtraServiceResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private ServicePriceType priceType;
    private String availability;
    private BigDecimal taxRate;
    private String category;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}