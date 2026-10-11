package com.athenura.hotel_management_system.room.controller;

import com.athenura.hotel_management_system.room.dto.RoomRequest;
import com.athenura.hotel_management_system.room.dto.RoomResponse;
import com.athenura.hotel_management_system.room.enums.RoomStatus;
import com.athenura.hotel_management_system.room.enums.RoomType;
import com.athenura.hotel_management_system.room.service.RoomService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping({"/admin/room", "/admin/rooms"})
@RequiredArgsConstructor
public class AdminRoomController {

    private final RoomService roomService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping(value = {"", "/create"}, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<RoomResponse> createRoomJson(@RequestBody RoomRequest roomRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoom(roomRequest));
    }

    @PostMapping(value = {"", "/create"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RoomResponse> createRoomMultipart(
            @RequestParam(value = "room", required = false) String roomJson,
            @RequestParam(value = "roomNumber", required = false) String roomNumber,
            @RequestParam(value = "roomType", required = false) RoomType roomType,
            @RequestParam(value = "pricePerNight", required = false) BigDecimal pricePerNight,
            @RequestParam(value = "capacity", required = false) Integer capacity,
            @RequestParam(value = "roomStatus", required = false) RoomStatus roomStatus,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            MultipartHttpServletRequest request) {

        RoomRequest roomRequest = parseRoomRequest(roomJson, roomNumber, roomType, pricePerNight, capacity, roomStatus);
        List<MultipartFile> allFiles = extractFiles(files, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoom(roomRequest, allFiles));
    }

    @PatchMapping(value = "/update/{roomNumber}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<RoomResponse> updateRoomJson(
            @PathVariable String roomNumber,
            @RequestBody RoomRequest roomRequest) {
        return ResponseEntity.ok().body(roomService.updateRoom(roomNumber, roomRequest));
    }

    @PatchMapping(value = "/update/{roomNumber}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RoomResponse> updateRoomMultipart(
            @PathVariable String roomNumber,
            @RequestParam(value = "room", required = false) String roomJson,
            @RequestParam(value = "roomType", required = false) RoomType roomType,
            @RequestParam(value = "pricePerNight", required = false) BigDecimal pricePerNight,
            @RequestParam(value = "capacity", required = false) Integer capacity,
            @RequestParam(value = "roomStatus", required = false) RoomStatus roomStatus,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            MultipartHttpServletRequest request) {

        RoomRequest roomRequest = parseRoomRequest(roomJson, roomNumber, roomType, pricePerNight, capacity, roomStatus);
        List<MultipartFile> allFiles = extractFiles(files, request);

        return ResponseEntity.ok().body(roomService.updateRoom(roomNumber, roomRequest, allFiles));
    }

    private RoomRequest parseRoomRequest(String roomJson, String roomNumber, RoomType roomType, BigDecimal pricePerNight, Integer capacity, RoomStatus roomStatus) {
        RoomRequest roomRequest = null;
        if (roomJson != null && !roomJson.isBlank()) {
            try {
                roomRequest = objectMapper.readValue(roomJson, RoomRequest.class);
            } catch (Exception ignored) {
            }
        }
        if (roomRequest == null) {
            roomRequest = RoomRequest.builder()
                    .roomNumber(roomNumber)
                    .roomType(roomType)
                    .pricePerNight(pricePerNight)
                    .capacity(capacity)
                    .roomStatus(roomStatus)
                    .build();
        }
        return roomRequest;
    }

    private List<MultipartFile> extractFiles(List<MultipartFile> files, MultipartHttpServletRequest request) {
        List<MultipartFile> allFiles = new ArrayList<>();
        if (files != null && !files.isEmpty()) {
            allFiles.addAll(files);
        } else if (request != null) {
            request.getMultiFileMap().forEach((key, fileList) -> {
                if (!"room".equals(key)) {
                    allFiles.addAll(fileList);
                }
            });
        }
        return allFiles.stream()
                .filter(f -> f != null && !f.isEmpty())
                .toList();
    }

    @DeleteMapping(value = {"/delete/{roomNumber}", "/{roomNumber}"})
    public ResponseEntity<String> deleteRoom(@PathVariable String roomNumber) {
        return ResponseEntity.ok().body(roomService.deleteRoom(roomNumber));
    }

    @GetMapping("/{roomNumber}")
    public ResponseEntity<RoomResponse> getRoomByRoomNumber(@PathVariable String roomNumber) {
        return ResponseEntity.ok(roomService.getRoomByRoomNumber(roomNumber));
    }

    @GetMapping
    public ResponseEntity<List<RoomResponse>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/type/{roomType}")
    public ResponseEntity<List<RoomResponse>> getRoomByRoomType(@PathVariable RoomType roomType) {
        return ResponseEntity.ok(roomService.getRoomByRoomType(roomType));
    }

    @GetMapping("/status/{roomStatus}")
    public ResponseEntity<List<RoomResponse>> getRoomByRoomStatus(@PathVariable RoomStatus roomStatus) {
        return ResponseEntity.ok(roomService.getRoomByRoomStatus(roomStatus));
    }
}