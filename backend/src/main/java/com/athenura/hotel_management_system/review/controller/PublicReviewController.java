package com.athenura.hotel_management_system.review.controller;

import com.athenura.hotel_management_system.review.dto.ReviewRequestDTO;
import com.athenura.hotel_management_system.review.dto.ReviewResponseDTO;
import com.athenura.hotel_management_system.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public/reviews")
@RequiredArgsConstructor
public class PublicReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<List<ReviewResponseDTO>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @PostMapping
    public ResponseEntity<?> createReview(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody ReviewRequestDTO requestDTO
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ") || authHeader.substring(7).isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Verified booking access token is required to submit a review."));
        }
        return ResponseEntity.ok(reviewService.createReview(requestDTO));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ReviewResponseDTO> toggleLike(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.incrementLike(id));
    }

    @DeleteMapping("/booking/{bookingReference}")
    public ResponseEntity<?> deleteReviewByBooking(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String bookingReference
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ") || authHeader.substring(7).isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Verified booking access token is required to remove a review."));
        }
        reviewService.deleteReviewByBookingReference(bookingReference);
        return ResponseEntity.ok(Map.of("message", "Review removed successfully."));
    }
}