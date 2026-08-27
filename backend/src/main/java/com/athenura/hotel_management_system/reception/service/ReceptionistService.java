package com.athenura.hotel_management_system.reception.service;

import com.athenura.hotel_management_system.common.entity.Users;
import com.athenura.hotel_management_system.reception.dto.ReceptionistRequest;
import com.athenura.hotel_management_system.reception.dto.ReceptionistResponse;
import com.athenura.hotel_management_system.reception.mapper.ReceptionistMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ReceptionistService {

    ReceptionistResponse createReceptionist(ReceptionistRequest request);

    ReceptionistResponse updateReceptionist(Long id, ReceptionistRequest request);

    String deleteReceptionist(Long id);

    ReceptionistResponse getReceptionistById(Long id);

    List<ReceptionistResponse> getAllReceptionists();
}
