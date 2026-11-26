package com.athenura.hotel_management_system.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponseDTO {
    private Long id;
    private String guestName;
    private String location;
    private Integer rating;
    private String comment;
    private boolean verified;
    private int likesCount;
    private LocalDate createdAt;
}