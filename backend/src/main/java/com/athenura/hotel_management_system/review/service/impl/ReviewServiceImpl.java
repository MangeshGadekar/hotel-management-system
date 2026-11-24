package com.athenura.hotel_management_system.review.service.impl;

import com.athenura.hotel_management_system.booking.entity.Booking;
import com.athenura.hotel_management_system.booking.repository.BookingRepository;
import com.athenura.hotel_management_system.review.dto.ReviewRequestDTO;
import com.athenura.hotel_management_system.review.dto.ReviewResponseDTO;
import com.athenura.hotel_management_system.review.entity.Review;
import com.athenura.hotel_management_system.review.mapper.ReviewMapper;
import com.athenura.hotel_management_system.review.repository.ReviewRepository;
import com.athenura.hotel_management_system.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final ReviewMapper reviewMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getAllReviews() {
        return reviewRepository.findAllByOrderByCreatedAtDescIdDesc()
                .stream()
                .map(reviewMapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public ReviewResponseDTO createReview(ReviewRequestDTO requestDTO) {
        String ref = requestDTO.getBookingReference();
        if (ref == null || ref.isBlank()) {
            throw new IllegalArgumentException("Booking reference is required for verified reviews.");
        }

        String cleanRef = ref.trim().toUpperCase();
        Optional<Booking> bookingOpt = bookingRepository.findByBookingReference(cleanRef);
        Booking booking = bookingOpt.orElseThrow(() -> new IllegalArgumentException("Invalid booking reference."));

        String status = booking.getBookingStatus() != null
                ? booking.getBookingStatus().name()
                : "";

        if (!"CHECKED_OUT".equalsIgnoreCase(status)) {
            throw new IllegalStateException("Reviews can only be submitted after your stay is completed and checked out.");
        }

        if (reviewRepository.existsByBookingReferenceIgnoreCase(cleanRef)) {
            throw new IllegalStateException("You have already submitted a review for this booking.");
        }

        if (booking.getGuest() != null) {
            String fullName = ((booking.getGuest().getFirstName() != null ? booking.getGuest().getFirstName() : "")
                    + " "
                    + (booking.getGuest().getLastName() != null ? booking.getGuest().getLastName() : "")).trim();
            if (!fullName.isBlank()) {
                requestDTO.setGuestName(fullName);
            }
        }

        Review review = reviewMapper.toEntity(requestDTO, true);
        Review saved = reviewRepository.save(review);
        return reviewMapper.toResponseDTO(saved);
    }

    @Override
    @Transactional
    public ReviewResponseDTO incrementLike(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + reviewId));
        review.setLikesCount(review.getLikesCount() + 1);
        return reviewMapper.toResponseDTO(reviewRepository.save(review));
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new RuntimeException("Review not found with id: " + reviewId);
        }
        reviewRepository.deleteById(reviewId);
    }

    @Override
    @Transactional
    public void deleteReviewByBookingReference(String bookingReference) {
        if (bookingReference == null || bookingReference.isBlank()) {
            throw new IllegalArgumentException("Booking reference is required.");
        }
        String cleanRef = bookingReference.trim().toUpperCase();
        Optional<Review> reviewOpt = reviewRepository.findByBookingReferenceIgnoreCase(cleanRef);
        Review review = reviewOpt.orElseThrow(() -> new IllegalArgumentException("No review found for this booking."));
        reviewRepository.delete(review);
    }
}