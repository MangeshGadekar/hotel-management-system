package com.athenura.hotel_management_system.extraservice.service.impl;

import com.athenura.hotel_management_system.extraservice.dto.ExtraServiceRequest;
import com.athenura.hotel_management_system.extraservice.dto.ExtraServiceResponse;
import com.athenura.hotel_management_system.extraservice.entity.ExtraService;
import com.athenura.hotel_management_system.extraservice.mapper.ExtraServiceMapper;
import com.athenura.hotel_management_system.extraservice.repository.ExtraServiceRepository;
import com.athenura.hotel_management_system.extraservice.service.ExtraServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExtraServiceServiceImpl implements ExtraServiceService {

    private final ExtraServiceRepository extraServiceRepository;
    private final ExtraServiceMapper extraServiceMapper;

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
        ExtraService existing = extraServiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Extra service not found with ID: " + id));

        extraServiceMapper.updateEntityFromRequest(request, existing);
        ExtraService updated = extraServiceRepository.save(existing);
        return extraServiceMapper.toResponse(updated);
    }

    @Override
    public ExtraServiceResponse getServiceById(Long id) {
        ExtraService service = extraServiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Extra service not found with ID: " + id));
        return extraServiceMapper.toResponse(service);
    }

    @Override
    public List<ExtraServiceResponse> getAllServices() {
        return extraServiceRepository.findAll()
                .stream()
                .map(extraServiceMapper::toResponse)
                .toList();
    }

    @Override
    public List<ExtraServiceResponse> getActiveServices() {
        return extraServiceRepository.findByActiveTrue()
                .stream()
                .map(extraServiceMapper::toResponse)
                .toList();
    }

    @Override
    public List<ExtraServiceResponse> getActiveServicesByCategory(String category) {
        return extraServiceRepository.findByCategoryAndActiveTrue(category)
                .stream()
                .map(extraServiceMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteService(Long id) {
        if (!extraServiceRepository.existsById(id)) {
            throw new RuntimeException("Extra service not found with ID: " + id);
        }
        extraServiceRepository.deleteById(id);
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
}