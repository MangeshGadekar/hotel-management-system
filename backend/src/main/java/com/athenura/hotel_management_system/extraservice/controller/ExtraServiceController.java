package com.athenura.hotel_management_system.extraservice.controller;

import com.athenura.hotel_management_system.extraservice.dto.ExtraServiceRequest;
import com.athenura.hotel_management_system.extraservice.dto.ExtraServiceResponse;
import com.athenura.hotel_management_system.extraservice.service.ExtraServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/extra-services")
@RequiredArgsConstructor
public class ExtraServiceController {

    private final ExtraServiceService extraServiceService;

    // Public / Receptionist: Get all active services
    @GetMapping
    public ResponseEntity<List<ExtraServiceResponse>> getActiveServices(
            @RequestParam(required = false) String category) {
        if (category != null && !category.trim().isEmpty()) {
            return ResponseEntity.ok(extraServiceService.getActiveServicesByCategory(category.trim()));
        }
        return ResponseEntity.ok(extraServiceService.getActiveServices());
    }

    // Get specific service details
    @GetMapping("/{id}")
    public ResponseEntity<ExtraServiceResponse> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(extraServiceService.getServiceById(id));
    }

    // Admin: Get all services (active + inactive)
    @GetMapping("/admin/all")
    public ResponseEntity<List<ExtraServiceResponse>> getAllServicesForAdmin() {
        return ResponseEntity.ok(extraServiceService.getAllServices());
    }

    // Admin: Create new extra service
    @PostMapping("/admin")
    public ResponseEntity<ExtraServiceResponse> createService(@Valid @RequestBody ExtraServiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(extraServiceService.createService(request));
    }

    // Admin: Update service details / tax rate / price
    @PutMapping("/admin/{id}")
    public ResponseEntity<ExtraServiceResponse> updateService(
            @PathVariable Long id,
            @Valid @RequestBody ExtraServiceRequest request) {
        return ResponseEntity.ok(extraServiceService.updateService(id, request));
    }

    // Admin: Toggle active/inactive status
    @PatchMapping("/admin/{id}/toggle-status")
    public ResponseEntity<ExtraServiceResponse> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(extraServiceService.toggleServiceStatus(id));
    }

    // Admin: Delete service
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<String> deleteService(@PathVariable Long id) {
        extraServiceService.deleteService(id);
        return ResponseEntity.ok("Extra service with ID " + id + " has been successfully deleted.");
    }
}