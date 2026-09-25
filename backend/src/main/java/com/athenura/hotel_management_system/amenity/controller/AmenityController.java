package com.athenura.hotel_management_system.amenity.controller;

import com.athenura.hotel_management_system.amenity.dto.AmenityResponse;
import com.athenura.hotel_management_system.amenity.service.AmenityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/amenity", "/api/amenities"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AmenityController {

    private final AmenityService amenityService;

    @GetMapping
    public ResponseEntity<List<AmenityResponse>> getActiveAmenities() {
        return ResponseEntity.ok(amenityService.getActiveAmenities());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AmenityResponse> getAmenityById(@PathVariable Long id) {
        return ResponseEntity.ok(amenityService.getAmenityById(id));
    }
}
