package com.athenura.hotel_management_system.reception.service.impl;

import com.athenura.hotel_management_system.common.entity.Users;
import com.athenura.hotel_management_system.common.enums.Role;
import com.athenura.hotel_management_system.common.repository.RefreshTokenRepo;
import com.athenura.hotel_management_system.common.repository.UserRepo;
import com.athenura.hotel_management_system.notification.service.EmailService;
import com.athenura.hotel_management_system.reception.dto.ReceptionistRequest;
import com.athenura.hotel_management_system.reception.dto.ReceptionistResponse;
import com.athenura.hotel_management_system.reception.mapper.ReceptionistMapper;
import com.athenura.hotel_management_system.reception.service.ReceptionistService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReceptionistServiceImpl implements ReceptionistService {

    private final UserRepo userRepo;
    private final RefreshTokenRepo refreshTokenRepo;
    private final ReceptionistMapper receptionistMapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    public ReceptionistResponse createReceptionist(ReceptionistRequest request) {

        if (userRepo.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new RuntimeException("Password is required for creating a Receptionist");
        }

        Users receptionist = receptionistMapper.toEntity(request);
        receptionist.setRole(Role.RECEPTIONIST);

        String rawPassword = request.getPassword();
        receptionist.setPassword(passwordEncoder.encode(rawPassword));

        Users savedReceptionist = userRepo.save(receptionist);

        emailService.sendReceptionistCredentials(savedReceptionist.getEmail(), rawPassword, savedReceptionist.getFirstName());

        return receptionistMapper.toResponse(savedReceptionist);
    }

    @Override
    public ReceptionistResponse updateReceptionist(Long id, ReceptionistRequest request) {
        Users receptionist = userRepo.findByIdAndRole(id, Role.RECEPTIONIST)
                .orElseThrow(() -> new RuntimeException("Receptionist not found"));

        if (request.getEmail() != null
                && !receptionist.getEmail().equals(request.getEmail())
                && userRepo.existsByEmail(request.getEmail())) {

            throw new RuntimeException("Email already exists");
        }

        if (request.getFirstName() != null) {
            receptionist.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            receptionist.setLastName(request.getLastName());
        }

        if (request.getEmail() != null) {
            receptionist.setEmail(request.getEmail());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            receptionist.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        Users updatedReceptionist = userRepo.save(receptionist);

        return receptionistMapper.toResponse(updatedReceptionist);
    }

    @Override
    public String deleteReceptionist(Long id) {
        Users receptionist = userRepo.findByIdAndRole(id, Role.RECEPTIONIST)
                .orElseThrow(() -> new RuntimeException("Receptionist not Found"));

        refreshTokenRepo.findByUser(receptionist).ifPresent(refreshTokenRepo::delete);

        userRepo.delete(receptionist);
        return "Receptionist with id " + id + " is Deleted";
    }

    @Override
    public ReceptionistResponse getReceptionistById(Long id) {
        Users receptionist = userRepo.findByIdAndRole(id, Role.RECEPTIONIST)
                .orElseThrow(() -> new RuntimeException("Receptionist not Found"));

        return receptionistMapper.toResponse(receptionist);
    }

    @Override
    public List<ReceptionistResponse> getAllReceptionists() {
        return userRepo.findAllByRole(Role.RECEPTIONIST)
                .stream()
                .map(receptionistMapper::toResponse)
                .toList();
    }
}