package com.athenura.hotel_management_system.room.mapper;

import com.athenura.hotel_management_system.room.dto.RoomRequest;
import com.athenura.hotel_management_system.room.dto.RoomResponse;
import com.athenura.hotel_management_system.room.entity.Room;
import com.athenura.hotel_management_system.room.enums.RoomStatus;
import org.springframework.stereotype.Component;

@Component
public class RoomMapper {

    // RoomRequest to Room entity
    public Room toEntity(RoomRequest roomRequest)
    {
        return Room.builder()
            .roomNumber(roomRequest.getRoomNumber())
            .roomType(roomRequest.getRoomType())
            .pricePerNight(roomRequest.getPricePerNight())
            .capacity(roomRequest.getCapacity())
            .roomStatus((roomRequest.getRoomStatus() != null ) ? roomRequest.getRoomStatus() : RoomStatus.AVAILABLE)
            .build();
    }

    // Room entity to RoomResponse
    public RoomResponse toResponse(Room room)
    {
        return RoomResponse.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .roomType(room.getRoomType())
                .pricePerNight(room.getPricePerNight())
                .capacity(room.getCapacity())
                .roomStatus(room.getRoomStatus())
                .build();
    }

}
