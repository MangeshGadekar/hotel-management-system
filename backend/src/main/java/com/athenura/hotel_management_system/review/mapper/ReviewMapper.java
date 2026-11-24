package com.athenura.hotel_management_system.review.mapper;

import com.athenura.hotel_management_system.review.dto.ReviewRequestDTO;
import com.athenura.hotel_management_system.review.dto.ReviewResponseDTO;
import com.athenura.hotel_management_system.review.entity.Review;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Component
public class ReviewMapper {

    public Review toEntity(ReviewRequestDTO dto, boolean isVerifiedStay) {
        if (dto == null) return null;

        int sanitizedRating = dto.getRating() != null
                ? Math.min(5, Math.max(1, dto.getRating()))
                : 5;

        String cleanLocation = (dto.getLocation() != null && !dto.getLocation().isBlank())
                ? dto.getLocation().trim()
                : "Nagpur, Maharashtra";

        String cleanBookingRef = (dto.getBookingReference() != null && !dto.getBookingReference().isBlank())
                ? dto.getBookingReference().trim().toUpperCase()
                : null;

        return Review.builder()
                .guestName(dto.getGuestName().trim())
                .location(cleanLocation)
                .rating(sanitizedRating)
                .comment(dto.getComment().trim())
                .bookingReference(cleanBookingRef)
                .verified(isVerifiedStay)
                .likesCount(0)
                .createdAt(LocalDate.now())
                .build();
    }

    public ReviewResponseDTO toResponseDTO(Review entity) {
        if (entity == null) return null;

        return ReviewResponseDTO.builder()
                .id(entity.getId())
                .guestName(entity.getGuestName())
                .location(entity.getLocation())
                .rating(entity.getRating())
                .comment(entity.getComment())
                .verified(entity.isVerified())
                .likesCount(entity.getLikesCount())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}