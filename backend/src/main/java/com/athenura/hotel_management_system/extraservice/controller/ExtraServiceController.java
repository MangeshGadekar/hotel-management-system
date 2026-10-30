package com.athenura.hotel_management_system.extraservice.controller;

import com.athenura.hotel_management_system.cloudinary.service.CloudinaryService;
import com.athenura.hotel_management_system.extraservice.dto.ExtraServiceRequest;
import com.athenura.hotel_management_system.extraservice.dto.ExtraServiceResponse;
import com.athenura.hotel_management_system.extraservice.service.ExtraServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/extra-services")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExtraServiceController {

    private final ExtraServiceService extraServiceService;
    private final CloudinaryService cloudinaryService;


    @GetMapping
    public ResponseEntity<List<ExtraServiceResponse>> getActiveServices(
            @RequestParam(required = false) String category) {
        if (category != null && !category.trim().isEmpty()) {
            return ResponseEntity.ok(extraServiceService.getActiveServicesByCategory(category.trim()));
        }
        return ResponseEntity.ok(extraServiceService.getActiveServices());
    }


    @GetMapping("/{id}")
    public ResponseEntity<ExtraServiceResponse> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(extraServiceService.getServiceById(id));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<ExtraServiceResponse>> getAllServicesForAdmin() {
        return ResponseEntity.ok(extraServiceService.getAllServices());
    }

    @PostMapping(value = "/admin", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ExtraServiceResponse> createService(
            @ModelAttribute @Valid ExtraServiceRequest request,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {

        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(imageFile, "extra-services");
            request.setImageUrl(imageUrl);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(extraServiceService.createService(request));
    }

    @PutMapping(value = "/admin/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ExtraServiceResponse> updateService(
            @PathVariable Long id,
            @ModelAttribute @Valid ExtraServiceRequest request,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {

        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(imageFile, "extra-services");
            request.setImageUrl(imageUrl);
        }

        return ResponseEntity.ok(extraServiceService.updateService(id, request));
    }

    @PatchMapping("/admin/{id}/toggle-status")
    public ResponseEntity<ExtraServiceResponse> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(extraServiceService.toggleServiceStatus(id));
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<String> deleteService(@PathVariable Long id) {
        extraServiceService.deleteService(id);
        return ResponseEntity.ok("Extra service with ID " + id + " has been successfully deleted.");
    }
}