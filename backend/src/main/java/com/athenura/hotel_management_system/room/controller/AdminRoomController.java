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

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;


@RestController
@RequestMapping({"/admin/room", "/admin/rooms", "/api/room", "/api/rooms"})
@RequiredArgsConstructor
public class AdminRoomController {

    private final RoomService roomService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping(value = {"", "/create"})
    public ResponseEntity<RoomResponse> createRoom(
            jakarta.servlet.http.HttpServletRequest request,
            @RequestParam(value = "room", required = false) String roomJson,
            @RequestParam(value = "roomNumber", required = false) String roomNumber,
            @RequestParam(value = "roomType", required = false) String roomType,
            @RequestParam(value = "pricePerNight", required = false) java.math.BigDecimal pricePerNight,
            @RequestParam(value = "capacity", required = false) Integer capacity,
            @RequestParam(value = "roomStatus", required = false) String roomStatus,
            @RequestParam(value = "photos", required = false) org.springframework.web.multipart.MultipartFile[] photos) throws Exception {

        String contentType = request.getContentType();
        RoomRequest roomRequest;

        if (contentType != null && contentType.toLowerCase().contains("application/json")) {
            roomRequest = objectMapper.readValue(request.getInputStream(), RoomRequest.class);
        } else if (roomJson != null && !roomJson.isBlank()) {
            roomRequest = objectMapper.readValue(roomJson, RoomRequest.class);
        } else {
            RoomType parsedType = (roomType != null && !roomType.isBlank())
                    ? RoomType.valueOf(roomType.trim().toUpperCase())
                    : RoomType.DELUXE;

            RoomStatus parsedStatus = (roomStatus != null && !roomStatus.isBlank())
                    ? RoomStatus.valueOf(roomStatus.trim().toUpperCase())
                    : RoomStatus.AVAILABLE;

            roomRequest = RoomRequest.builder()
                    .roomNumber(roomNumber)
                    .roomType(parsedType)
                    .pricePerNight(pricePerNight)
                    .capacity(capacity)
                    .roomStatus(parsedStatus)
                    .build();
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoom(roomRequest, photos));
    }

    @PostMapping(value = {"/{roomNumber}/photos", "/upload-photos/{roomNumber}"}, consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RoomResponse> addPhotosToRoom(
            @PathVariable String roomNumber,
            @RequestParam(value = "photos", required = false) org.springframework.web.multipart.MultipartFile[] photos) {

        return ResponseEntity.ok(roomService.addPhotosToRoom(roomNumber, photos));
    }

    @PutMapping(value = {"/{roomNumber}/photos", "/replace-photos/{roomNumber}"}, consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RoomResponse> replacePhotosOfRoom(
            @PathVariable String roomNumber,
            @RequestParam(value = "photos", required = false) org.springframework.web.multipart.MultipartFile[] photos) {

        return ResponseEntity.ok(roomService.replacePhotosOfRoom(roomNumber, photos));
    }

    @DeleteMapping(value = {"/{roomNumber}/photos", "/{roomNumber}/photo"})
    public ResponseEntity<RoomResponse> deletePhotoFromRoom(
            @PathVariable String roomNumber,
            @RequestParam(value = "photoUrl", required = false) String photoUrlParam,
            @RequestBody(required = false) java.util.Map<String, String> body) {

        String photoUrl = photoUrlParam;
        if ((photoUrl == null || photoUrl.isBlank()) && body != null) {
            photoUrl = body.getOrDefault("photoUrl", body.get("imageUrl"));
        }
        return ResponseEntity.ok(roomService.deletePhotoFromRoom(roomNumber, photoUrl));
    }

    @DeleteMapping(value = {"/{roomNumber}/photos/all", "/{roomNumber}/photos/clear"})
    public ResponseEntity<RoomResponse> deleteAllPhotosFromRoom(@PathVariable String roomNumber) {
        return ResponseEntity.ok(roomService.deleteAllPhotosFromRoom(roomNumber));
    }

    @RequestMapping(value = {"/update/{roomNumber}", "/{roomNumber}/update", "/{roomNumber}"}, method = {RequestMethod.PATCH, RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<RoomResponse> updateRoom(
            @PathVariable String roomNumber,
            jakarta.servlet.http.HttpServletRequest request,
            @RequestParam(value = "room", required = false) String roomJson,
            @RequestParam(value = "newRoomNumber", required = false) String newRoomNumber,
            @RequestParam(value = "roomType", required = false) String roomType,
            @RequestParam(value = "pricePerNight", required = false) java.math.BigDecimal pricePerNight,
            @RequestParam(value = "capacity", required = false) Integer capacity,
            @RequestParam(value = "roomStatus", required = false) String roomStatus,
            @RequestParam(value = "photos", required = false) org.springframework.web.multipart.MultipartFile[] photos) throws Exception {

        String contentType = request.getContentType();
        RoomRequest roomRequest;

        if (contentType != null && contentType.toLowerCase().contains("application/json")) {
            roomRequest = objectMapper.readValue(request.getInputStream(), RoomRequest.class);
        } else if (roomJson != null && !roomJson.isBlank()) {
            roomRequest = objectMapper.readValue(roomJson, RoomRequest.class);
        } else {
            RoomType parsedType = (roomType != null && !roomType.isBlank())
                    ? RoomType.valueOf(roomType.trim().toUpperCase())
                    : null;

            RoomStatus parsedStatus = (roomStatus != null && !roomStatus.isBlank())
                    ? RoomStatus.valueOf(roomStatus.trim().toUpperCase())
                    : null;

            roomRequest = RoomRequest.builder()
                    .roomNumber(newRoomNumber)
                    .roomType(parsedType)
                    .pricePerNight(pricePerNight)
                    .capacity(capacity)
                    .roomStatus(parsedStatus)
                    .build();
        }

        return ResponseEntity.ok(roomService.updateRoom(roomNumber, roomRequest, photos));
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

}
