package com.athenura.hotel_management_system.amenity.service;

import com.athenura.hotel_management_system.amenity.dto.AmenityRequest;
import com.athenura.hotel_management_system.amenity.dto.AmenityResponse;

import java.util.List;

public interface AmenityService {

    AmenityResponse createAmenity(AmenityRequest request);

    AmenityResponse updateAmenity(Long id, AmenityRequest request);

    String deleteAmenity(Long id);

    AmenityResponse getAmenityById(Long id);

    List<AmenityResponse> getAllAmenities();

    List<AmenityResponse> getActiveAmenities();
}
