package com.athenura.hotel_management_system.room.service;

import com.athenura.hotel_management_system.room.dto.RoomRequest;
import com.athenura.hotel_management_system.room.dto.RoomResponse;
import com.athenura.hotel_management_system.room.entity.Room;
import com.athenura.hotel_management_system.room.enums.RoomStatus;
import com.athenura.hotel_management_system.room.enums.RoomType;

import java.util.List;

public interface RoomService {
    default RoomResponse createRoom(RoomRequest roomRequest) {
        return createRoom(roomRequest, null);
    }

    RoomResponse createRoom(RoomRequest roomRequest, org.springframework.web.multipart.MultipartFile[] photos);

    RoomResponse addPhotosToRoom(String roomNumber, org.springframework.web.multipart.MultipartFile[] photos);

    default RoomResponse updateRoom(String roomNumber, RoomRequest roomRequest) {
        return updateRoom(roomNumber, roomRequest, null);
    }

    RoomResponse updateRoom(String roomNumber, RoomRequest roomRequest, org.springframework.web.multipart.MultipartFile[] photos);

    RoomResponse replacePhotosOfRoom(String roomNumber, org.springframework.web.multipart.MultipartFile[] photos);

    RoomResponse deletePhotoFromRoom(String roomNumber, String photoUrl);

    RoomResponse deleteAllPhotosFromRoom(String roomNumber);

    String deleteRoom(String roomNumber);

    List<RoomResponse> getAllRooms();

    RoomResponse getRoomByRoomNumber(String roomNumber);

    List<RoomResponse> getRoomByRoomType(RoomType roomType);

    List<RoomResponse> getRoomByRoomStatus(RoomStatus roomStatus);



}
