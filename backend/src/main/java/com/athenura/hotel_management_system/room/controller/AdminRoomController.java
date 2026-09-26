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
@RequestMapping({"/admin/room", "/admin/rooms", "/api/room", "/api/rooms"})
@RequiredArgsConstructor
public class AdminRoomController {

    private final RoomService roomService;

    @PostMapping({"", "/create"})
    public ResponseEntity<RoomResponse> createRoom(@RequestBody RoomRequest roomRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoom(roomRequest));
    }


    @PatchMapping("/update/{roomNumber}")
    public ResponseEntity<RoomResponse> updateRoom(
            @PathVariable String roomNumber,
            @RequestBody RoomRequest roomRequest) {
        return ResponseEntity.ok().body(roomService.updateRoom(roomNumber, roomRequest));
    }

    @DeleteMapping(value = {"/delete/{roomNumber}", "/{roomNumber}"})
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

    @PostMapping(value = "/{roomNumber}/upload-images", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RoomResponse> uploadRoomImages(
            @PathVariable String roomNumber,
            @RequestParam(value = "files", required = false) List<org.springframework.web.multipart.MultipartFile> files,
            @RequestParam(value = "file", required = false) List<org.springframework.web.multipart.MultipartFile> file,
            @RequestParam(value = "photos", required = false) List<org.springframework.web.multipart.MultipartFile> photos,
            @RequestParam(value = "image", required = false) List<org.springframework.web.multipart.MultipartFile> image,
            org.springframework.web.multipart.MultipartHttpServletRequest request) {

        List<org.springframework.web.multipart.MultipartFile> allFiles = new java.util.ArrayList<>();
        if (files != null) allFiles.addAll(files);
        if (file != null) allFiles.addAll(file);
        if (photos != null) allFiles.addAll(photos);
        if (image != null) allFiles.addAll(image);

        if (allFiles.isEmpty() && request != null) {
            request.getMultiFileMap().values().forEach(allFiles::addAll);
        }

        List<org.springframework.web.multipart.MultipartFile> validFiles = allFiles.stream()
                .filter(f -> f != null && !f.isEmpty())
                .toList();

        if (validFiles.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(roomService.uploadRoomImages(roomNumber, validFiles));
    }

    @DeleteMapping("/{roomNumber}/remove-image")
    public ResponseEntity<RoomResponse> removeRoomImage(
            @PathVariable String roomNumber,
            @RequestParam String imageUrl) {
        return ResponseEntity.ok(roomService.removeRoomImage(roomNumber, imageUrl));
    }
}
