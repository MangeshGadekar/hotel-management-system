package com.athenura.hotel_management_system.reception.controller;

import com.athenura.hotel_management_system.reception.dto.ReceptionistRequest;
import com.athenura.hotel_management_system.reception.dto.ReceptionistResponse;
import com.athenura.hotel_management_system.reception.service.ReceptionistService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/receptionist")
public class AdminReceptionistController {

    private final ReceptionistService receptionistService;

    @PostMapping("/create")
    public ResponseEntity<ReceptionistResponse> createReceptionist (
            @RequestBody ReceptionistRequest request){

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(receptionistService.createReceptionist(request));
    }

    @PatchMapping("/update/{id}")
    public ResponseEntity<ReceptionistResponse> updateReceptionist(
            @PathVariable Long id,
            @RequestBody ReceptionistRequest request) {

        return ResponseEntity.ok(
                receptionistService.updateReceptionist(id, request)
        );
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteReceptionist(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                receptionistService.deleteReceptionist(id)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReceptionistResponse> getReceptionistById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                receptionistService.getReceptionistById(id)
        );
    }

    @GetMapping
    public ResponseEntity<List<ReceptionistResponse>> getAllReceptionists() {

        return ResponseEntity.ok(
                receptionistService.getAllReceptionists()
        );
    }
}
