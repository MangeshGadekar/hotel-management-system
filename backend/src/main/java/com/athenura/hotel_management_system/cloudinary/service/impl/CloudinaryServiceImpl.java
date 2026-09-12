package com.athenura.hotel_management_system.cloudinary.service.impl;

import com.athenura.hotel_management_system.cloudinary.service.CloudinaryService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"
    );

    @Override
    public String uploadImage(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_EXTENSIONS.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed.");
        }

        try {
            String targetFolder = (folder != null && !folder.isBlank()) ? folder : "hotel_management/rooms";
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", targetFolder,
                            "resource_type", "image"
                    )
            );

            Object secureUrl = uploadResult.get("secure_url");
            if (secureUrl == null) {
                throw new RuntimeException("Failed to obtain secure URL from Cloudinary upload");
            }

            log.info("Successfully uploaded image to Cloudinary: {}", secureUrl);
            return secureUrl.toString();

        } catch (IOException e) {
            log.error("Failed to read image bytes for upload: {}", e.getMessage(), e);
            throw new RuntimeException("Error reading image file: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Cloudinary upload failed: {}", e.getMessage(), e);
            throw new RuntimeException("Cloudinary upload failed: " + e.getMessage(), e);
        }
    }

    @Override
    public List<String> uploadImages(List<MultipartFile> files, String folder) {
        if (files == null || files.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> uploadedUrls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                uploadedUrls.add(uploadImage(file, folder));
            }
        }
        return uploadedUrls;
    }

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> deleteImage(String publicId) {
        if (publicId == null || publicId.isBlank()) {
            throw new IllegalArgumentException("Public ID cannot be blank");
        }
        try {
            return (Map<String, Object>) cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            log.error("Failed to delete image with publicId {}: {}", publicId, e.getMessage(), e);
            throw new RuntimeException("Cloudinary image deletion failed: " + e.getMessage(), e);
        }
    }

    @Override
    public String extractPublicIdFromUrl(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains("cloudinary.com")) {
            return null;
        }
        try {
            // Cloudinary URLs typically look like:
            // https://res.cloudinary.com/<cloud_name>/image/upload/v1234567890/folder/subfolder/public_id.jpg
            String[] parts = imageUrl.split("/upload/");
            if (parts.length < 2) return null;
            String pathAfterUpload = parts[1];
            // Remove version prefix (v1234567890/) if present
            String withoutVersion = pathAfterUpload.replaceFirst("^v\\d+/", "");
            // Strip extension (.jpg, .png, etc.)
            int dotIndex = withoutVersion.lastIndexOf('.');
            return (dotIndex != -1) ? withoutVersion.substring(0, dotIndex) : withoutVersion;
        } catch (Exception e) {
            log.warn("Could not extract public ID from URL: {}", imageUrl);
            return null;
        }
    }
}
