package com.athenura.hotel_management_system.room.service;

import com.athenura.hotel_management_system.room.dto.RoomRequest;
import com.athenura.hotel_management_system.room.dto.RoomResponse;
import com.athenura.hotel_management_system.room.enums.RoomStatus;
import com.athenura.hotel_management_system.room.enums.RoomType;

import java.util.List;

public interface RoomService {
    RoomResponse createRoom(RoomRequest roomRequest);

    RoomResponse createRoom(RoomRequest roomRequest, List<org.springframework.web.multipart.MultipartFile> files);

    RoomResponse updateRoom(String roomNumber, RoomRequest roomRequest);

    String deleteRoom(String roomNumber);

    List<RoomResponse> getAllRooms();

    RoomResponse getRoomByRoomNumber(String roomNumber);

    List<RoomResponse> getRoomByRoomType(RoomType roomType);

    List<RoomResponse> getRoomByRoomStatus(RoomStatus roomStatus);
}
