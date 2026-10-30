package com.athenura.hotel_management_system.booking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class GuestBookingRequest {

    private String roomNumber;
    private List<String> roomNumbers;

    private Long roomId;
    private List<Long> roomIds;

    @NotNull(message = "Check-in date is required")
    private LocalDate checkInDate;

    @NotNull(message = "Check-out date is required")
    private LocalDate checkOutDate;

    private Integer totalGuests;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @Email(message = "Valid email is required")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phone;

    private List<Long> serviceIds;
    private String couponCode;

    public List<String> resolveRoomNumbers() {
        if (roomNumbers != null && !roomNumbers.isEmpty()) {
            return roomNumbers.stream().map(String::trim).filter(s -> !s.isEmpty()).toList();
        }
        if (roomNumber != null && !roomNumber.isBlank()) {
            String[] split = roomNumber.split(",");
            List<String> list = new ArrayList<>();
            for (String s : split) {
                if (!s.trim().isEmpty()) list.add(s.trim());
            }
            return list;
        }
        return List.of();
    }
}