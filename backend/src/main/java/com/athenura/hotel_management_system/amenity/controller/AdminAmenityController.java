package com.athenura.hotel_management_system.amenity.controller;

import com.athenura.hotel_management_system.amenity.dto.AmenityRequest;
import com.athenura.hotel_management_system.amenity.dto.AmenityResponse;
import com.athenura.hotel_management_system.amenity.service.AmenityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/admin/amenity", "/admin/amenities", "/api/admin/amenities"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminAmenityController {

    private final AmenityService amenityService;

    @PostMapping
    public ResponseEntity<AmenityResponse> createAmenity(@Valid @RequestBody AmenityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(amenityService.createAmenity(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AmenityResponse> updateAmenity(
            @PathVariable Long id,
            @Valid @RequestBody AmenityRequest request) {
        return ResponseEntity.ok(amenityService.updateAmenity(id, request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<AmenityResponse> patchAmenity(
            @PathVariable Long id,
            @RequestBody AmenityRequest request) {
        return ResponseEntity.ok(amenityService.updateAmenity(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAmenity(@PathVariable Long id) {
        return ResponseEntity.ok(amenityService.deleteAmenity(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AmenityResponse> getAmenityById(@PathVariable Long id) {
        return ResponseEntity.ok(amenityService.getAmenityById(id));
    }

    @GetMapping
    public ResponseEntity<List<AmenityResponse>> getAllAmenities() {
        return ResponseEntity.ok(amenityService.getAllAmenities());
    }
}
