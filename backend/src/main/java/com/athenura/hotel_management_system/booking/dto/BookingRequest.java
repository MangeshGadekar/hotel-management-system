package com.athenura.hotel_management_system.booking.dto;

import com.athenura.hotel_management_system.guest.dto.GuestRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {

    private Long guestId;

    @Valid
    private GuestRequest guest;

    private Long roomId;

    private List<Long> roomIds;

    @NotNull(message = "Check-in date is required")
    @FutureOrPresent(message = "Check-in date cannot be in the past")
    private LocalDate checkInDate;

    @NotNull(message = "Check-out date is required")
    private LocalDate checkOutDate;

    private Integer totalGuests;

    private String paymentType;
    private String paymentMethod;

    @DecimalMin(value = "0.00", inclusive = true, message = "Amount cannot be negative")
    private BigDecimal amount;

    private List<Long> extraServiceIds;
    private String transactionReference;
    private String couponCode;

    @DecimalMin(value = "0.00", inclusive = true, message = "Discount cannot be negative")
    private BigDecimal customDiscount;

    private String customDiscountType;     // "FLAT" or "PERCENT"
    private String discountReason;

    public List<Long> resolveRoomIds() {
        if (roomIds != null && !roomIds.isEmpty()) {
            return roomIds;
        }
        if (roomId != null) {
            return List.of(roomId);
        }
        return new ArrayList<>();
    }
}