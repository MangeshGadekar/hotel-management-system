package com.athenura.hotel_management_system.room.dto;

import com.athenura.hotel_management_system.room.enums.RoomStatus;
import com.athenura.hotel_management_system.room.enums.RoomType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomRequest {
    @NotBlank
    private String roomNumber;
    @NotNull
    private RoomType roomType;
    @NotNull
    private BigDecimal pricePerNight;
    @NotNull
    private Integer capacity;

    private RoomStatus roomStatus;
}
