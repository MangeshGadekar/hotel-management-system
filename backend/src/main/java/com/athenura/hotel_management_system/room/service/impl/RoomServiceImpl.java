package com.athenura.hotel_management_system.room.service.impl;

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

import com.athenura.hotel_management_system.cloudinary.service.CloudinaryService;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final RoomMapper roomMapper;
    private final CloudinaryService cloudinaryService;

    @Override
    public RoomResponse createRoom(RoomRequest roomRequest, MultipartFile[] photos) {

        if (roomRepository.existsByRoomNumber(roomRequest.getRoomNumber()))
            throw new RuntimeException("Room Already Exists");

        List<String> uploadedUrls = new ArrayList<>();

        if (roomRequest.getImages() != null) {
            uploadedUrls.addAll(roomRequest.getImages());
        }

        if (photos != null && photos.length > 0) {
            List<String> cloudinaryUrls = cloudinaryService.uploadImages(
                    Arrays.asList(photos),
                    "hotel_management/rooms"
            );
            uploadedUrls.addAll(cloudinaryUrls);
        }

        roomRequest.setImages(uploadedUrls);
        Room room = roomMapper.toEntity(roomRequest);
        Room savedRoom = roomRepository.save(room);
        return roomMapper.toResponse(savedRoom);
    }

    @Override
    public RoomResponse addPhotosToRoom(String roomNumber, MultipartFile[] photos) {
        Room room = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new RoomNotFoundException("Room with number " + roomNumber + " not found."));

        if (photos != null && photos.length > 0) {
            List<String> cloudinaryUrls = cloudinaryService.uploadImages(
                    Arrays.asList(photos),
                    "hotel_management/rooms"
            );
            if (room.getImages() == null) {
                room.setImages(new ArrayList<>());
            }
            room.getImages().addAll(cloudinaryUrls);
            Room saved = roomRepository.save(room);
            return roomMapper.toResponse(saved);
        }
        return roomMapper.toResponse(room);
    }

    @Override
    public RoomResponse updateRoom(String roomNumber, RoomRequest roomRequest, MultipartFile[] photos) {

        Room room = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new RoomNotFoundException("Room with number " + roomNumber + " not found."));

        if (roomRequest != null) {
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

            if (roomRequest.getImages() != null) {
                room.setImages(roomRequest.getImages());
            }
        }

        if (photos != null && photos.length > 0) {
            List<String> cloudinaryUrls = cloudinaryService.uploadImages(
                    Arrays.asList(photos),
                    "hotel_management/rooms"
            );
            if (room.getImages() == null) {
                room.setImages(new ArrayList<>());
            }
            room.getImages().addAll(cloudinaryUrls);
        }

        Room updatedRoom = roomRepository.save(room);
        return roomMapper.toResponse(updatedRoom);
    }

    @Override
    public RoomResponse replacePhotosOfRoom(String roomNumber, MultipartFile[] photos) {
        Room room = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new RoomNotFoundException("Room with number " + roomNumber + " not found."));

        if (room.getImages() != null && !room.getImages().isEmpty()) {
            for (String oldUrl : room.getImages()) {
                String publicId = cloudinaryService.extractPublicIdFromUrl(oldUrl);
                if (publicId != null) {
                    try {
                        cloudinaryService.deleteImage(publicId);
                    } catch (Exception ignored) {
                    }
                }
            }
            room.getImages().clear();
        } else {
            room.setImages(new ArrayList<>());
        }

        if (photos != null && photos.length > 0) {
            List<String> cloudinaryUrls = cloudinaryService.uploadImages(
                    Arrays.asList(photos),
                    "hotel_management/rooms"
            );
            room.getImages().addAll(cloudinaryUrls);
        }

        Room saved = roomRepository.save(room);
        return roomMapper.toResponse(saved);
    }

    @Override
    public RoomResponse deletePhotoFromRoom(String roomNumber, String photoUrl) {
        Room room = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new RoomNotFoundException("Room with number " + roomNumber + " not found."));

        if (photoUrl != null && !photoUrl.isBlank() && room.getImages() != null) {
            String publicId = cloudinaryService.extractPublicIdFromUrl(photoUrl);
            if (publicId != null) {
                try {
                    cloudinaryService.deleteImage(publicId);
                } catch (Exception ignored) {
                }
            }
            room.getImages().removeIf(img -> img.equals(photoUrl) || (publicId != null && img.contains(publicId)));
            Room saved = roomRepository.save(room);
            return roomMapper.toResponse(saved);
        }

        return roomMapper.toResponse(room);
    }

    @Override
    public RoomResponse deleteAllPhotosFromRoom(String roomNumber) {
        Room room = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new RoomNotFoundException("Room with number " + roomNumber + " not found."));

        if (room.getImages() != null && !room.getImages().isEmpty()) {
            for (String img : room.getImages()) {
                String publicId = cloudinaryService.extractPublicIdFromUrl(img);
                if (publicId != null) {
                    try {
                        cloudinaryService.deleteImage(publicId);
                    } catch (Exception ignored) {
                    }
                }
            }
            room.getImages().clear();
            Room saved = roomRepository.save(room);
            return roomMapper.toResponse(saved);
        }

        return roomMapper.toResponse(room);
    }

    @Override
    public String deleteRoom(String roomNumber) {

        Room room = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new RoomNotFoundException("Room not found"));

        if (room.getImages() != null && !room.getImages().isEmpty()) {
            for (String img : room.getImages()) {
                String publicId = cloudinaryService.extractPublicIdFromUrl(img);
                if (publicId != null) {
                    try {
                        cloudinaryService.deleteImage(publicId);
                    } catch (Exception ignored) {
                    }
                }
            }
        }

        roomRepository.delete(room);

        return "Room and associated photos deleted successfully.";
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

        List<Room> rooms = roomRepository.findAll();

        return rooms.stream()
                .map(roomMapper::toResponse)
                .toList();
    }


}
