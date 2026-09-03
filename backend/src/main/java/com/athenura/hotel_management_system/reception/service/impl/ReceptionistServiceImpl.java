package com.athenura.hotel_management_system.reception.service.impl;

import com.athenura.hotel_management_system.common.entity.Users;
import com.athenura.hotel_management_system.common.enums.Role;
import com.athenura.hotel_management_system.common.repository.UserRepo;
import com.athenura.hotel_management_system.reception.dto.ReceptionistRequest;
import com.athenura.hotel_management_system.reception.dto.ReceptionistResponse;
import com.athenura.hotel_management_system.reception.mapper.ReceptionistMapper;
import com.athenura.hotel_management_system.reception.service.ReceptionistService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReceptionistServiceImpl implements ReceptionistService {

    private final UserRepo userRepo;
    private final ReceptionistMapper receptionistMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public ReceptionistResponse createReceptionist(ReceptionistRequest request){

        if (userRepo.existsByEmail(request.getEmail()))
            throw new RuntimeException("Email already exists");

        if (userRepo.existsByUsername(request.getUsername()))
            throw new RuntimeException("Username already exists");

        Users receptionist = receptionistMapper.toEntity(request);
        receptionist.setPassword(passwordEncoder.encode(receptionist.getPassword()));
        Users savedReceptionist = userRepo.save(receptionist);

        return receptionistMapper.toResponse(savedReceptionist);
    }

    @Override
    public ReceptionistResponse updateReceptionist(Long id, ReceptionistRequest request) {
        Users receptionist = userRepo.findByIdAndRole(id, Role.RECEPTIONIST)
                .orElseThrow(() -> new RuntimeException("Receptionist not found"));

        // Email validation
        if (request.getEmail() != null
                && !receptionist.getEmail().equals(request.getEmail())
                && userRepo.existsByEmail(request.getEmail())) {

            throw new RuntimeException("Email already exists");
        }

        // Username validation
        if (request.getUsername() != null
                && !receptionist.getUsername().equals(request.getUsername())
                && userRepo.existsByUsername(request.getUsername())) {

            throw new RuntimeException("Username already exists");
        }

        // Partial Update
        if (request.getFirstName() != null) {
            receptionist.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            receptionist.setLastName(request.getLastName());
        }

        if (request.getUsername() != null) {
            receptionist.setUsername(request.getUsername());
        }

        if (request.getEmail() != null) {
            receptionist.setEmail(request.getEmail());
        }

        if (request.getPassword() != null) {
            receptionist.setPassword(
                    passwordEncoder.encode(request.getPassword())
            );
        }

        Users updatedReceptionist = userRepo.save(receptionist);

        return receptionistMapper.toResponse(updatedReceptionist);
    }

    @Override
    public String deleteReceptionist(Long id) {

        Users receptionist = userRepo.findByIdAndRole(id, Role.RECEPTIONIST)
                .orElseThrow(()-> new RuntimeException("Receptionist not Found"));

        userRepo.delete(receptionist);
        return "Receptionist with id "+ id +"is Deleted";
    }

    @Override
    public ReceptionistResponse getReceptionistById(Long id) {
        Users receptionist = userRepo.findByIdAndRole(id, Role.RECEPTIONIST)
                .orElseThrow(()-> new RuntimeException("Receptionist not Found"));

        return receptionistMapper.toResponse(receptionist);
    }

    @Override
    public List<ReceptionistResponse> getAllReceptionists() {

        return userRepo.findAllByRole(Role.RECEPTIONIST)
                .stream()
                .map(receptionistMapper::toResponse)
//                .map(user -> receptionistMapper.toResponse(user))
                .toList();
    }
}
