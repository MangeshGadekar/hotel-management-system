package com.athenura.hotel_management_system.review.repository;

import com.athenura.hotel_management_system.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findAllByOrderByCreatedAtDescIdDesc();
    boolean existsByBookingReferenceIgnoreCase(String bookingReference);

    Optional<Review> findByBookingReferenceIgnoreCase(String bookingReference);
}