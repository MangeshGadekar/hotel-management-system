package com.athenura.hotel_management_system.review.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "guest_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String guestName;

    private String location;

    @Column(nullable = false)
    private Integer rating;

    @Column(nullable = false, length = 1000)
    private String comment;

    private String bookingReference;

    @Builder.Default
    private boolean verified = false;

    @Builder.Default
    private int likesCount = 0;

    @Builder.Default
    private LocalDate createdAt = LocalDate.now();
}