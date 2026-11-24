package com.athenura.hotel_management_system.extraservice.service.impl;

import com.athenura.hotel_management_system.cloudinary.service.CloudinaryService;
import com.athenura.hotel_management_system.extraservice.dto.ExtraServiceRequest;
import com.athenura.hotel_management_system.extraservice.dto.ExtraServiceResponse;
import com.athenura.hotel_management_system.extraservice.entity.ExtraService;
import com.athenura.hotel_management_system.extraservice.mapper.ExtraServiceMapper;
import com.athenura.hotel_management_system.extraservice.repository.ExtraServiceRepository;
import com.athenura.hotel_management_system.extraservice.service.ExtraServiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExtraServiceServiceImpl implements ExtraServiceService {

    private final ExtraServiceRepository extraServiceRepository;
    private final ExtraServiceMapper extraServiceMapper;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional
    public ExtraServiceResponse createService(ExtraServiceRequest request) {
        ExtraService entity = extraServiceMapper.toEntity(request);
        ExtraService saved = extraServiceRepository.save(entity);
        return extraServiceMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ExtraServiceResponse updateService(Long id, ExtraServiceRequest request) {
        ExtraService service = extraServiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Extra service not found with ID: " + id));
        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()
                && service.getImageUrl() != null && !service.getImageUrl().equalsIgnoreCase(request.getImageUrl())) {
            deleteCloudinaryImageQuietly(service.getImageUrl());
        }

        extraServiceMapper.updateEntityFromRequest(request, service);
        ExtraService updated = extraServiceRepository.save(service);
        return extraServiceMapper.toResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public ExtraServiceResponse getServiceById(Long id) {
        ExtraService service = extraServiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Extra service not found with ID: " + id));
        return extraServiceMapper.toResponse(service);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExtraServiceResponse> getAllServices() {
        return extraServiceRepository.findByBookingIdIsNull()
                .stream()
                .map(extraServiceMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExtraServiceResponse> getActiveServices() {
        return extraServiceRepository.findByActiveTrueAndBookingIdIsNull()
                .stream()
                .map(extraServiceMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExtraServiceResponse> getActiveServicesByCategory(String category) {
        return extraServiceRepository.findByCategoryAndActiveTrueAndBookingIdIsNull(category)
                .stream()
                .map(extraServiceMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteService(Long id) {
        ExtraService service = extraServiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Extra service not found with ID: " + id));
        if (service.getImageUrl() != null && !service.getImageUrl().isBlank()) {
            deleteCloudinaryImageQuietly(service.getImageUrl());
        }

        extraServiceRepository.delete(service);
    }

    @Override
    @Transactional
    public ExtraServiceResponse toggleServiceStatus(Long id) {
        ExtraService service = extraServiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Extra service not found with ID: " + id));
        service.setActive(!Boolean.TRUE.equals(service.getActive()));
        ExtraService saved = extraServiceRepository.save(service);
        return extraServiceMapper.toResponse(saved);
    }

    private void deleteCloudinaryImageQuietly(String imageUrl) {
        try {
            String publicId = cloudinaryService.extractPublicIdFromUrl(imageUrl);
            if (publicId != null && !publicId.isBlank()) {
                cloudinaryService.deleteImage(publicId);
            }
        } catch (Exception e) {
            log.warn("Failed to delete Cloudinary image '{}': {}", imageUrl, e.getMessage());
        }
    }
}