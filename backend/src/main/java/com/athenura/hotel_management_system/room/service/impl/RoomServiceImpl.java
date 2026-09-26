package com.athenura.hotel_management_system.room.service.impl;

import com.athenura.hotel_management_system.amenity.repository.AmenityRepository;
import com.athenura.hotel_management_system.cloudinary.service.CloudinaryService;
import com.athenura.hotel_management_system.common.exception.RoomNotFoundException;
import com.athenura.hotel_management_system.room.dto.RoomRequest;
import com.athenura.hotel_management_system.room.dto.RoomResponse;
import com.athenura.hotel_management_system.room.entity.Room;
import com.athenura.hotel_management_system.room.enums.RoomStatus;
import com.athenura.hotel_management_system.room.enums.RoomType;
import com.athenura.hotel_management_system.room.mapper.RoomMapper;
import com.athenura.hotel_management_system.room.repository.RoomRepository;
import com.athenura.hotel_management_system.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final RoomMapper roomMapper;
    private final AmenityRepository amenityRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    public RoomResponse createRoom(RoomRequest roomRequest) {

        if(roomRepository.existsByRoomNumber(roomRequest.getRoomNumber()))
            throw new RuntimeException("Room Already Exists");

        Room room = roomMapper.toEntity(roomRequest);
        if (roomRequest.getAmenityIds() != null && !roomRequest.getAmenityIds().isEmpty()) {
            room.setAmenities(amenityRepository.findAllById(roomRequest.getAmenityIds()));
        }
        Room savedRoom = roomRepository.save(room);
        return roomMapper.toResponse(savedRoom);
    }

    @Override
    public RoomResponse updateRoom(String roomNumber, RoomRequest roomRequest) {

        Room room = roomRepository.findByRoomNumber(roomNumber).orElseThrow(()-> new RoomNotFoundException("Room with number " + roomNumber + " not found."));

        if (roomRequest.getRoomNumber() != null &&
                !room.getRoomNumber().equals(roomRequest.getRoomNumber()) &&
                roomRepository.existsByRoomNumber(roomRequest.getRoomNumber()))
        {
            throw new RuntimeException("Room number already exists");
        }

        if (roomRequest.getRoomNumber() != null) {
            room.setRoomNumber(roomRequest.getRoomNumber());
        }

        if (roomRequest.getRoomType() != null) {
            room.setRoomType(roomRequest.getRoomType());
        }

        if (roomRequest.getPricePerNight() != null) {
            room.setPricePerNight(roomRequest.getPricePerNight());
        }

        if (roomRequest.getCapacity() != null) {
            room.setCapacity(roomRequest.getCapacity());
        }

        if (roomRequest.getRoomStatus() != null) {
            room.setRoomStatus(roomRequest.getRoomStatus());
        }

        if (roomRequest.getImages() != null) {
            room.setImages(roomRequest.getImages());
        }

        if (roomRequest.getAmenityIds() != null) {
            room.setAmenities(amenityRepository.findAllById(roomRequest.getAmenityIds()));
        }

        Room updatedRoom = roomRepository.save(room);
        return roomMapper.toResponse(updatedRoom);
    }

    @Override
    public String deleteRoom(String roomNumber) {

        Room room = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new RoomNotFoundException("Room not found"));

        roomRepository.delete(room);

        return "Room deleted successfully.";
    }

    @Override
    public RoomResponse getRoomByRoomNumber(String roomNumber) {

        Room room = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new RoomNotFoundException("Room not found"));

        return roomMapper.toResponse(room);
    }

    @Override
    public List<RoomResponse> getRoomByRoomType(RoomType roomType) {

        return roomRepository.findByRoomType(roomType)
                .stream()
                .map(roomMapper::toResponse)
                .toList();
    }

    @Override
    public List<RoomResponse> getRoomByRoomStatus(RoomStatus roomStatus) {

        return roomRepository.findByRoomStatus(roomStatus)
                .stream()
                .map(roomMapper::toResponse)
                .toList();
    }

    @Override
    public List<RoomResponse> getAllRooms() {

        return roomRepository.findAll()
                .stream()
                .map(roomMapper::toResponse)
                .toList();
    }

    @Override
    public RoomResponse uploadRoomImages(String roomNumber, List<MultipartFile> files) {
        Room room = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new RoomNotFoundException("Room with number " + roomNumber + " not found."));

        List<String> uploadedUrls = cloudinaryService.uploadImages(files, "hotel_management/rooms");
        if (room.getImages() == null) {
            room.setImages(new ArrayList<>());
        }
        room.getImages().addAll(uploadedUrls);

        Room updatedRoom = roomRepository.save(room);
        return roomMapper.toResponse(updatedRoom);
    }

    @Override
    public RoomResponse removeRoomImage(String roomNumber, String imageUrl) {
        Room room = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new RoomNotFoundException("Room with number " + roomNumber + " not found."));

        if (room.getImages() != null && imageUrl != null) {
            room.getImages().removeIf(url -> url.equalsIgnoreCase(imageUrl.trim()));
            String publicId = cloudinaryService.extractPublicIdFromUrl(imageUrl);
            if (publicId != null) {
                try {
                    cloudinaryService.deleteImage(publicId);
                } catch (Exception e) {
                    // log warning
                }
            }
        }

        Room updatedRoom = roomRepository.save(room);
        return roomMapper.toResponse(updatedRoom);
    }
}
