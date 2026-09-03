package com.athenura.hotel_management_system.room.controller;


import com.athenura.hotel_management_system.room.dto.RoomRequest;
import com.athenura.hotel_management_system.room.dto.RoomResponse;
import com.athenura.hotel_management_system.room.enums.RoomStatus;
import com.athenura.hotel_management_system.room.enums.RoomType;
import com.athenura.hotel_management_system.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/room")
@RequiredArgsConstructor
public class AdminRoomController {

    private final RoomService roomService;

    @PostMapping("create")
    public ResponseEntity<RoomResponse> createRoom(@RequestBody RoomRequest roomRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoom(roomRequest));
    }

    // partial update of room details
    @PatchMapping("/update/{roomNumber}")
    public ResponseEntity<RoomResponse> updateRoom(
            @PathVariable String roomNumber,
            @RequestBody RoomRequest roomRequest) {
        return ResponseEntity.ok().body(roomService.updateRoom(roomNumber, roomRequest));
    }

    @DeleteMapping("/delete/{roomNumber}")
    public ResponseEntity<String> deleteRoom(@PathVariable String roomNumber) {
        return ResponseEntity.ok().body(roomService.deleteRoom(roomNumber));
    }

    @GetMapping("/{roomNumber}")
    public ResponseEntity<RoomResponse> getRoomByRoomNumber(
            @PathVariable String roomNumber) {

        return ResponseEntity.ok(
                roomService.getRoomByRoomNumber(roomNumber)
        );
    }

    @GetMapping
    public ResponseEntity<List<RoomResponse>> getAllRooms() {

        return ResponseEntity.ok(
                roomService.getAllRooms()
        );
    }

    @GetMapping("/type/{roomType}")
    public ResponseEntity<List<RoomResponse>> getRoomByRoomType(
            @PathVariable RoomType roomType) {

        return ResponseEntity.ok(
                roomService.getRoomByRoomType(roomType));
    }

    @GetMapping("/status/{roomStatus}")
    public ResponseEntity<List<RoomResponse>> getRoomByRoomStatus(
            @PathVariable RoomStatus roomStatus) {

        return ResponseEntity.ok(
                roomService.getRoomByRoomStatus(roomStatus));
    }

}
