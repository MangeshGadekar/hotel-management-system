package com.athenura.hotel_management_system.room.controller;

import com.athenura.hotel_management_system.room.dto.RoomRequest;
import com.athenura.hotel_management_system.room.dto.RoomResponse;
import com.athenura.hotel_management_system.room.enums.RoomStatus;
import com.athenura.hotel_management_system.room.enums.RoomType;
import com.athenura.hotel_management_system.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.util.List;

@RestController
@RequestMapping({"/admin/room", "/admin/rooms"})
@RequiredArgsConstructor
public class AdminRoomController {

    private final RoomService roomService;

    @PostMapping(value = {"", "/create"}, consumes = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<RoomResponse> createRoomJson(@RequestBody RoomRequest roomRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoom(roomRequest));
    }

    @PostMapping(value = {"", "/create"}, consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RoomResponse> createRoomMultipart(
            @RequestPart(value = "room", required = false) String roomJson,
            @ModelAttribute RoomRequest formRoomRequest,
            @RequestParam(value = "files", required = false) List<org.springframework.web.multipart.MultipartFile> files,
            @RequestParam(value = "file", required = false) List<org.springframework.web.multipart.MultipartFile> file,
            @RequestParam(value = "photos", required = false) List<org.springframework.web.multipart.MultipartFile> photos,
            @RequestParam(value = "photo", required = false) List<org.springframework.web.multipart.MultipartFile> photo,
            @RequestParam(value = "image", required = false) List<org.springframework.web.multipart.MultipartFile> image,
            @RequestParam(value = "images", required = false) List<org.springframework.web.multipart.MultipartFile> images,
            org.springframework.web.multipart.MultipartHttpServletRequest request) {

        RoomRequest roomRequest = formRoomRequest;

        if (roomJson != null && !roomJson.isBlank()) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                roomRequest = mapper.readValue(roomJson, RoomRequest.class);
            } catch (Exception e) {
                // Keep formRoomRequest if JSON parsing fails
            }
        }

        List<org.springframework.web.multipart.MultipartFile> allFiles = new java.util.ArrayList<>();
        if (files != null) allFiles.addAll(files);
        if (file != null) allFiles.addAll(file);
        if (photos != null) allFiles.addAll(photos);
        if (photo != null) allFiles.addAll(photo);
        if (image != null) allFiles.addAll(image);
        if (images != null) allFiles.addAll(images);

        if (allFiles.isEmpty() && request != null) {
            request.getMultiFileMap().values().forEach(allFiles::addAll);
        }

        List<org.springframework.web.multipart.MultipartFile> validFiles = allFiles.stream()
                .filter(f -> f != null && !f.isEmpty())
                .toList();

        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoom(roomRequest, validFiles));
    }


    @PostMapping(value = "/create-with-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RoomResponse> createRoomWithImages(
            @RequestPart("room") RoomRequest roomRequest,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "file", required = false) List<MultipartFile> file,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            MultipartHttpServletRequest request) {

        List<MultipartFile> allFiles = new java.util.ArrayList<>();
        if (files != null) allFiles.addAll(files);
        if (file != null) allFiles.addAll(file);
        if (images != null) allFiles.addAll(images);

        if (allFiles.isEmpty() && request != null) {
            request.getMultiFileMap().forEach((key, list) -> {
                if (!"room".equals(key)) {
                    allFiles.addAll(list);
                }
            });
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoom(roomRequest, allFiles));
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
}
