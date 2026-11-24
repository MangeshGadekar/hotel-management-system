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

    private static final Set<String> ALLOWED_IMAGE_MIMES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/jpg",
            "image/gif", "image/avif", "image/svg+xml", "image/bmp", "image/jfif"
    );

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg", ".bmp", ".jfif"
    );

    @Override
    public String uploadImage(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }

        validateImageFile(file);

        try {
            String targetFolder = (folder != null && !folder.isBlank()) ? folder.trim() : "hotel_management/rooms";
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
    public boolean deleteImage(String publicId) {
        if (publicId == null || publicId.isBlank()) {
            throw new IllegalArgumentException("Public ID cannot be blank");
        }
        try {
            Map<?, ?> result = cloudinary.uploader().destroy(publicId.trim(), ObjectUtils.emptyMap());
            String status = String.valueOf(result.get("result"));
            boolean isSuccess = "ok".equalsIgnoreCase(status);
            if (!isSuccess) {
                log.warn("Cloudinary delete response for publicId '{}': {}", publicId, status);
            }
            return isSuccess;
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
            String[] parts = imageUrl.split("/upload/");
            if (parts.length < 2) return null;
            String pathAfterUpload = parts[1];

            // Strip version prefix (e.g. v1234567890/) or transformation prefixes before version
            String sanitized = pathAfterUpload.replaceFirst("^(?:[a-zA-Z0-9_,]+/)*v\\d+/", "");

            // Strip file extension (.jpg, .png, etc.)
            int dotIndex = sanitized.lastIndexOf('.');
            return (dotIndex != -1) ? sanitized.substring(0, dotIndex) : sanitized;
        } catch (Exception e) {
            log.warn("Could not extract public ID from URL: {}", imageUrl);
            return null;
        }
    }

    private void validateImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();

        boolean validExtension = false;
        if (originalFilename != null && originalFilename.contains(".")) {
            String ext = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase().trim();
            validExtension = ALLOWED_EXTENSIONS.contains(ext);
        }

        boolean validMime = contentType != null && ALLOWED_IMAGE_MIMES.contains(contentType.toLowerCase().trim());

        if (!validExtension && !validMime) {
            throw new IllegalArgumentException("Invalid file type. Only image formats (JPEG, PNG, WEBP, GIF, etc.) are permitted.");
        }
    }
}