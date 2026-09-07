package com.athenura.hotel_management_system.cloudinary.controller;

import com.athenura.hotel_management_system.cloudinary.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cloudinary")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CloudinaryController {

    private final CloudinaryService cloudinaryService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<String>> uploadImages(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "folder", defaultValue = "hotel_management/rooms") String folder) {

        List<String> urls = cloudinaryService.uploadImages(files, folder);
        return ResponseEntity.ok(urls);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, Object>> deleteImage(
            @RequestParam(value = "publicId", required = false) String publicId,
            @RequestParam(value = "imageUrl", required = false) String imageUrl) {

        String idToDelete = publicId;
        if ((idToDelete == null || idToDelete.isBlank()) && imageUrl != null) {
            idToDelete = cloudinaryService.extractPublicIdFromUrl(imageUrl);
        }

        if (idToDelete == null || idToDelete.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Either publicId or imageUrl must be provided"));
        }

        Map<String, Object> result = cloudinaryService.deleteImage(idToDelete);
        return ResponseEntity.ok(result);
    }
}
