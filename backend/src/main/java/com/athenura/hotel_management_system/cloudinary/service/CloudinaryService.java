package com.athenura.hotel_management_system.cloudinary.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface CloudinaryService {

    String uploadImage(MultipartFile file, String folder);

    List<String> uploadImages(List<MultipartFile> files, String folder);

    Map<String, Object> deleteImage(String publicId);

    String extractPublicIdFromUrl(String imageUrl);
}
