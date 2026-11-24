package com.athenura.hotel_management_system.review.service;

import com.athenura.hotel_management_system.review.dto.ReviewRequestDTO;
import com.athenura.hotel_management_system.review.dto.ReviewResponseDTO;
import java.util.List;

public interface ReviewService {
    List<ReviewResponseDTO> getAllReviews();
    ReviewResponseDTO createReview(ReviewRequestDTO requestDTO);
    ReviewResponseDTO incrementLike(Long reviewId);
    void deleteReview(Long reviewId);
    void deleteReviewByBookingReference(String bookingReference);
}