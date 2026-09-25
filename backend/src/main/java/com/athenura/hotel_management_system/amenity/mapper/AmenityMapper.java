package com.athenura.hotel_management_system.amenity.mapper;

import com.athenura.hotel_management_system.amenity.dto.AmenityRequest;
import com.athenura.hotel_management_system.amenity.dto.AmenityResponse;
import com.athenura.hotel_management_system.amenity.entity.Amenity;
import com.athenura.hotel_management_system.amenity.enums.AmenityPriceType;
import org.springframework.stereotype.Component;

@Component
public class AmenityMapper {

    public Amenity toEntity(AmenityRequest request) {
        if (request == null) {
            return null;
        }

        return Amenity.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .price(request.getPrice())
                .priceType(request.getPriceType() != null ? request.getPriceType() : AmenityPriceType.PER_NIGHT)
                .active(request.getActive() != null ? request.getActive() : true)
                .icon(request.getIcon())
                .build();
    }

    public AmenityResponse toResponse(Amenity entity) {
        if (entity == null) {
            return null;
        }

        return AmenityResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .price(entity.getPrice())
                .priceType(entity.getPriceType())
                .active(entity.isActive())
                .icon(entity.getIcon())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public void updateEntityFromRequest(AmenityRequest request, Amenity entity) {
        if (request == null || entity == null) {
            return;
        }

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
        if (request.getActive() != null) {
            entity.setActive(request.getActive());
        }
        if (request.getIcon() != null) {
            entity.setIcon(request.getIcon());
        }
    }
}
