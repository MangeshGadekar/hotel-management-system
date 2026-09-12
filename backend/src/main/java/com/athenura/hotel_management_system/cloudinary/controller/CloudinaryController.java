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
    public ResponseEntity<?> uploadImages(
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "file", required = false) List<MultipartFile> file,
            @RequestParam(value = "photos", required = false) List<MultipartFile> photos,
            @RequestParam(value = "photo", required = false) List<MultipartFile> photo,
            @RequestParam(value = "image", required = false) List<MultipartFile> image,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "folder", defaultValue = "hotel_management/rooms") String folder,
            org.springframework.web.multipart.MultipartHttpServletRequest request) {

        List<MultipartFile> allFiles = new java.util.ArrayList<>();
        if (files != null) allFiles.addAll(files);
        if (file != null) allFiles.addAll(file);
        if (photos != null) allFiles.addAll(photos);
        if (photo != null) allFiles.addAll(photo);
        if (image != null) allFiles.addAll(image);
        if (images != null) allFiles.addAll(images);

        if (allFiles.isEmpty() && request != null) {
            request.getMultiFileMap().values().forEach(allFiles::addAll);
        }

        List<MultipartFile> validFiles = allFiles.stream()
                .filter(f -> f != null && !f.isEmpty())
                .toList();

        if (validFiles.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided. Please attach an image file."));
        }

        List<String> urls = cloudinaryService.uploadImages(validFiles, folder);
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
