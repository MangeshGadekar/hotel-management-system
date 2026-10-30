package com.athenura.hotel_management_system.room.service.impl;

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
import jakarta.transaction.Transactional;
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
    private final CloudinaryService cloudinaryService;

    @Override
    public RoomResponse createRoom(RoomRequest roomRequest) {
        return createRoom(roomRequest, null);
    }

    @Override
    @Transactional
    public RoomResponse createRoom(RoomRequest roomRequest, List<MultipartFile> files) {

        if (roomRepository.existsByRoomNumber(roomRequest.getRoomNumber()))
            throw new RuntimeException("Room Already Exists");

        Room room = roomMapper.toEntity(roomRequest);

        if (roomRequest.getAmenities() != null) {
            if (room.getAmenities() == null) {
                room.setAmenities(new ArrayList<>());
            } else {
                room.getAmenities().clear();
            }
            room.getAmenities().addAll(roomRequest.getAmenities());
        } else if (room.getAmenities() == null) {
            room.setAmenities(new ArrayList<>());
        }

        if (files != null && !files.isEmpty()) {
            List<MultipartFile> validFiles = files.stream()
                    .filter(f -> f != null && !f.isEmpty())
                    .toList();

            if (!validFiles.isEmpty()) {
                List<String> uploadedUrls = cloudinaryService.uploadImages(validFiles, "hotel_management/rooms");
                if (room.getImages() == null) {
                    room.setImages(new ArrayList<>());
                }
                room.getImages().addAll(uploadedUrls);
            }
        }

        Room savedRoom = roomRepository.save(room);
        return roomMapper.toResponse(savedRoom);
    }

    @Override
    public RoomResponse updateRoom(String roomNumber, RoomRequest roomRequest) {
        return updateRoom(roomNumber, roomRequest, null);
    }

    @Override
    @Transactional
    public RoomResponse updateRoom(String roomNumber, RoomRequest roomRequest, List<MultipartFile> files) {

        Room room = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new RoomNotFoundException("Room with number " + roomNumber + " not found."));

        if (roomRequest.getRoomNumber() != null &&
                !room.getRoomNumber().equals(roomRequest.getRoomNumber()) &&
                roomRepository.existsByRoomNumber(roomRequest.getRoomNumber())) {
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

        if (roomRequest.getAmenities() != null) {
            if (room.getAmenities() == null) {
                room.setAmenities(new ArrayList<>());
            } else {
                room.getAmenities().clear();
            }
            room.getAmenities().addAll(roomRequest.getAmenities());
        }

        List<String> updatedImages = new ArrayList<>();
        if (roomRequest.getImages() != null) {
            updatedImages.addAll(roomRequest.getImages());
        }

        if (files != null && !files.isEmpty()) {
            List<MultipartFile> validFiles = files.stream()
                    .filter(f -> f != null && !f.isEmpty())
                    .toList();

            if (!validFiles.isEmpty()) {
                List<String> uploadedUrls = cloudinaryService.uploadImages(validFiles, "hotel_management/rooms");
                updatedImages.addAll(uploadedUrls);
            }
        }

        room.setImages(updatedImages);
        Room updatedRoom = roomRepository.save(room);
        return roomMapper.toResponse(updatedRoom);
    }

    @Override
    @Transactional
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
    @Transactional
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
    @Transactional
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
                }
            }
        }

        Room updatedRoom = roomRepository.save(room);
        return roomMapper.toResponse(updatedRoom);
    }


    @Override
    @Transactional
    public RoomResponse updateRoomStatus(String roomNumber, RoomStatus newStatus) {
        Room room = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new RuntimeException("Room not found with number: " + roomNumber));

        if (newStatus == RoomStatus.AVAILABLE && room.getRoomStatus() == RoomStatus.OCCUPIED) {
            throw new IllegalStateException("Cannot mark room " + roomNumber + " as AVAILABLE while it is still OCCUPIED by a checked-in guest.");
        }

        room.setRoomStatus(newStatus);
        Room updatedRoom = roomRepository.save(room);
        return roomMapper.toResponse(updatedRoom);
    }

}