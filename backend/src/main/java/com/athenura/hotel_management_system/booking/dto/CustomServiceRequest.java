package com.athenura.hotel_management_system.booking.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomServiceRequest {
    private String serviceName;
    private BigDecimal price;
    private BigDecimal taxRate;
}