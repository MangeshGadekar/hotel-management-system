package com.athenura.hotel_management_system.extraservice.service;

import com.athenura.hotel_management_system.extraservice.dto.ExtraServiceRequest;
import com.athenura.hotel_management_system.extraservice.dto.ExtraServiceResponse;

import java.util.List;

public interface ExtraServiceService {
    ExtraServiceResponse createService(ExtraServiceRequest request);
    ExtraServiceResponse updateService(Long id, ExtraServiceRequest request);
    ExtraServiceResponse getServiceById(Long id);
    List<ExtraServiceResponse> getAllServices();
    List<ExtraServiceResponse> getActiveServices();
    List<ExtraServiceResponse> getActiveServicesByCategory(String category);
    void deleteService(Long id);
    ExtraServiceResponse toggleServiceStatus(Long id);
}