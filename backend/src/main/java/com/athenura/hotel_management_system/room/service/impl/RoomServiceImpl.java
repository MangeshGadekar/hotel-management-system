package com.athenura.hotel_management_system.room.service.impl;

import com.athenura.hotel_management_system.amenity.dto.AmenityRequest;
import com.athenura.hotel_management_system.amenity.entity.Amenity;
import com.athenura.hotel_management_system.amenity.enums.AmenityPriceType;
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

import java.math.BigDecimal;
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
        return createRoom(roomRequest, null);
    }

    @Override
    public RoomResponse createRoom(RoomRequest roomRequest, List<MultipartFile> files) {

        if(roomRepository.existsByRoomNumber(roomRequest.getRoomNumber()))
            throw new RuntimeException("Room Already Exists");

        Room room = roomMapper.toEntity(roomRequest);

        // Resolve existing and new amenities
        List<Amenity> resolvedAmenities = resolveAmenities(roomRequest);
        if (!resolvedAmenities.isEmpty()) {
            room.setAmenities(resolvedAmenities);
        }

        // Upload images if provided during room creation
        if (files != null && !files.isEmpty()) {
            List<String> uploadedUrls = cloudinaryService.uploadImages(files, "hotel_management/rooms");
            if (room.getImages() == null) {
                room.setImages(new ArrayList<>());
            }
            room.getImages().addAll(uploadedUrls);
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

        if (roomRequest.getAmenityIds() != null || roomRequest.getNewAmenities() != null || roomRequest.getAmenityNames() != null) {
            room.setAmenities(resolveAmenities(roomRequest));
        }

        Room updatedRoom = roomRepository.save(room);
        return roomMapper.toResponse(updatedRoom);
    }

    private List<Amenity> resolveAmenities(RoomRequest roomRequest) {
        List<Amenity> amenities = new ArrayList<>();

        // 1. Resolve existing amenity IDs
        if (roomRequest.getAmenityIds() != null && !roomRequest.getAmenityIds().isEmpty()) {
            amenities.addAll(amenityRepository.findAllById(roomRequest.getAmenityIds()));
        }

        // 2. Resolve & Create new amenity objects
        if (roomRequest.getNewAmenities() != null && !roomRequest.getNewAmenities().isEmpty()) {
            for (AmenityRequest newAmenityReq : roomRequest.getNewAmenities()) {
                if (newAmenityReq != null && newAmenityReq.getName() != null && !newAmenityReq.getName().isBlank()) {
                    String name = newAmenityReq.getName().trim();
                    Amenity amenity = amenityRepository.findByNameIgnoreCase(name)
                            .orElseGet(() -> amenityRepository.save(
                                    Amenity.builder()
                                            .name(name)
                                            .description(newAmenityReq.getDescription())
                                            .price(newAmenityReq.getPrice() != null ? newAmenityReq.getPrice() : BigDecimal.ZERO)
                                            .priceType(newAmenityReq.getPriceType() != null ? newAmenityReq.getPriceType() : AmenityPriceType.PER_NIGHT)
                                            .active(newAmenityReq.getActive() != null ? newAmenityReq.getActive() : true)
                                            .icon(newAmenityReq.getIcon())
                                            .build()
                            ));
                    if (!amenities.contains(amenity)) {
                        amenities.add(amenity);
                    }
                }
            }
        }

        // 3. Resolve & Create amenity names strings
        if (roomRequest.getAmenityNames() != null && !roomRequest.getAmenityNames().isEmpty()) {
            for (String nameStr : roomRequest.getAmenityNames()) {
                if (nameStr != null && !nameStr.isBlank()) {
                    String name = nameStr.trim();
                    Amenity amenity = amenityRepository.findByNameIgnoreCase(name)
                            .orElseGet(() -> amenityRepository.save(
                                    Amenity.builder()
                                            .name(name)
                                            .price(BigDecimal.ZERO)
                                            .priceType(AmenityPriceType.PER_NIGHT)
                                            .active(true)
                                            .build()
                            ));
                    if (!amenities.contains(amenity)) {
                        amenities.add(amenity);
                    }
                }
            }
        }

        return amenities;
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
}
