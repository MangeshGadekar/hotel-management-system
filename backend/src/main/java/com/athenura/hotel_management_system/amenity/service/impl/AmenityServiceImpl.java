package com.athenura.hotel_management_system.amenity.service.impl;

import com.athenura.hotel_management_system.amenity.dto.AmenityRequest;
import com.athenura.hotel_management_system.amenity.dto.AmenityResponse;
import com.athenura.hotel_management_system.amenity.entity.Amenity;
import com.athenura.hotel_management_system.amenity.mapper.AmenityMapper;
import com.athenura.hotel_management_system.amenity.repository.AmenityRepository;
import com.athenura.hotel_management_system.amenity.service.AmenityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AmenityServiceImpl implements AmenityService {

    private final AmenityRepository amenityRepository;
    private final AmenityMapper amenityMapper;

    @Override
    @Transactional
    public AmenityResponse createAmenity(AmenityRequest request) {
        if (amenityRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new RuntimeException("Amenity with name '" + request.getName() + "' already exists");
        }

        Amenity entity = amenityMapper.toEntity(request);
        Amenity savedEntity = amenityRepository.save(entity);
        return amenityMapper.toResponse(savedEntity);
    }

    @Override
    @Transactional
    public AmenityResponse updateAmenity(Long id, AmenityRequest request) {
        Amenity amenity = amenityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Amenity not found with ID: " + id));

        if (request.getName() != null &&
                !amenity.getName().equalsIgnoreCase(request.getName().trim()) &&
                amenityRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new RuntimeException("Amenity with name '" + request.getName() + "' already exists");
        }

        amenityMapper.updateEntityFromRequest(request, amenity);
        Amenity updatedAmenity = amenityRepository.save(amenity);
        return amenityMapper.toResponse(updatedAmenity);
    }

    @Override
    @Transactional
    public String deleteAmenity(Long id) {
        Amenity amenity = amenityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Amenity not found with ID: " + id));

        amenityRepository.delete(amenity);
        return "Amenity deleted successfully with ID: " + id;
    }

    @Override
    @Transactional(readOnly = true)
    public AmenityResponse getAmenityById(Long id) {
        Amenity amenity = amenityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Amenity not found with ID: " + id));

        return amenityMapper.toResponse(amenity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AmenityResponse> getAllAmenities() {
        return amenityRepository.findAll()
                .stream()
                .map(amenityMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AmenityResponse> getActiveAmenities() {
        return amenityRepository.findByActiveTrue()
                .stream()
                .map(amenityMapper::toResponse)
                .toList();
    }
}
