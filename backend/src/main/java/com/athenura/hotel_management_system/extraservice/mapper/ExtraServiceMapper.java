package com.athenura.hotel_management_system.extraservice.mapper;

import com.athenura.hotel_management_system.extraservice.dto.ExtraServiceRequest;
import com.athenura.hotel_management_system.extraservice.dto.ExtraServiceResponse;
import com.athenura.hotel_management_system.extraservice.entity.ExtraService;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class ExtraServiceMapper {

    public ExtraService toEntity(ExtraServiceRequest request) {
        if (request == null) return null;

        return ExtraService.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .priceType(request.getPriceType() != null ? request.getPriceType() : com.athenura.hotel_management_system.extraservice.enums.ServicePriceType.PER_STAY)
                .availability(request.getAvailability() != null ? request.getAvailability() : "Daily")
                .taxRate(request.getTaxRate() != null ? request.getTaxRate() : new BigDecimal("18.00"))
                .category(request.getCategory())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();
    }

    public ExtraServiceResponse toResponse(ExtraService entity) {
        if (entity == null) return null;

        return ExtraServiceResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .price(entity.getPrice())
                .priceType(entity.getPriceType())
                .availability(entity.getAvailability())
                .taxRate(entity.getTaxRate())
                .category(entity.getCategory())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public void updateEntityFromRequest(ExtraServiceRequest request, ExtraService entity) {
        if (request == null || entity == null) return;

        if (request.getName() != null) entity.setName(request.getName());
        if (request.getDescription() != null) entity.setDescription(request.getDescription());
        if (request.getPrice() != null) entity.setPrice(request.getPrice());
        if (request.getPriceType() != null) entity.setPriceType(request.getPriceType());
        if (request.getAvailability() != null) entity.setAvailability(request.getAvailability());
        if (request.getTaxRate() != null) entity.setTaxRate(request.getTaxRate());
        if (request.getCategory() != null) entity.setCategory(request.getCategory());
        if (request.getActive() != null) entity.setActive(request.getActive());
    }
}