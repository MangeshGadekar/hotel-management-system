package com.athenura.hotel_management_system.cloudinary.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CloudinaryService {

    String uploadImage(MultipartFile file, String folder);

    List<String> uploadImages(List<MultipartFile> files, String folder);

    boolean deleteImage(String publicId);

    String extractPublicIdFromUrl(String imageUrl);
}