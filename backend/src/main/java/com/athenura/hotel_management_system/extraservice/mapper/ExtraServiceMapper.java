package com.athenura.hotel_management_system.extraservice.mapper;

import com.athenura.hotel_management_system.extraservice.dto.ExtraServiceRequest;
import com.athenura.hotel_management_system.extraservice.dto.ExtraServiceResponse;
import com.athenura.hotel_management_system.extraservice.entity.ExtraService;
import com.athenura.hotel_management_system.extraservice.enums.ServicePriceType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class ExtraServiceMapper {

    public ExtraService toEntity(ExtraServiceRequest request) {
        if (request == null) return null;

        return ExtraService.builder()
                .name(request.getName() != null ? request.getName().trim() : null)
                .description(request.getDescription())
                .price(request.getPrice())
                .priceType(request.getPriceType() != null ? request.getPriceType() : ServicePriceType.PER_STAY)
                .availability(request.getAvailability() != null && !request.getAvailability().isBlank() ? request.getAvailability().trim() : "Daily")
                .taxRate(request.getTaxRate() != null ? request.getTaxRate() : new BigDecimal("18.00"))
                .category(request.getCategory() != null ? request.getCategory().trim() : null)
                .imageUrl(request.getImageUrl())
                .active(request.getActive() != null ? request.getActive() : true)
                .paid(false)
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
                .imageUrl(entity.getImageUrl())
                .paid(Boolean.TRUE.equals(entity.getPaid()))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public void updateEntityFromRequest(ExtraServiceRequest request, ExtraService entity) {
        if (request == null || entity == null) return;

        if (request.getName() != null && !request.getName().isBlank()) {
            entity.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            entity.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            entity.setPrice(request.getPrice());
        }
        if (request.getPriceType() != null) {
            entity.setPriceType(request.getPriceType());
        }
        if (request.getAvailability() != null && !request.getAvailability().isBlank()) {
            entity.setAvailability(request.getAvailability().trim());
        }
        if (request.getTaxRate() != null) {
            entity.setTaxRate(request.getTaxRate());
        }
        if (request.getCategory() != null) {
            entity.setCategory(request.getCategory().trim());
        }
        if (request.getActive() != null) {
            entity.setActive(request.getActive());
        }
        // Protect existing image: only overwrite if a non-blank URL is provided
        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            entity.setImageUrl(request.getImageUrl().trim());
        }
    }
}