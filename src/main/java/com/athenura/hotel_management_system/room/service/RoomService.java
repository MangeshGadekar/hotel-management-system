package com.athenura.hotel_management_system.room.service;

import com.athenura.hotel_management_system.room.dto.RoomRequest;
import com.athenura.hotel_management_system.room.dto.RoomResponse;
import com.athenura.hotel_management_system.room.entity.Room;
import com.athenura.hotel_management_system.room.enums.RoomStatus;
import com.athenura.hotel_management_system.room.enums.RoomType;

import java.util.List;

public interface RoomService {
    RoomResponse createRoom(RoomRequest roomRequest);

    RoomResponse updateRoom(String roomNumber, RoomRequest roomRequest);

    String deleteRoom(String roomNumber);

    List<RoomResponse> getAllRooms();

    RoomResponse getRoomByRoomNumber(String roomNumber);

    List<RoomResponse> getRoomByRoomType(RoomType roomType);

    List<RoomResponse> getRoomByRoomStatus(RoomStatus roomStatus);



}
