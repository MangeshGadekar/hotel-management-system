package com.athenura.hotel_management_system.guest.mapper;

import com.athenura.hotel_management_system.guest.dto.GuestRequest;
import com.athenura.hotel_management_system.guest.dto.GuestResponse;
import com.athenura.hotel_management_system.guest.entity.Guest;
import org.springframework.stereotype.Component;

@Component
public class GuestMapper {

    public Guest toEntity(GuestRequest request) {
        if (request == null) {
            return null;
        }

        return Guest.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .dateOfBirth(request.getDateOfBirth())
                .idProofType(request.getIdProofType())
                .idProofNumber(request.getIdProofNumber())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .createdBy(request.getCreatedBy())
                .isVerified(false)
                .build();
    }

    public GuestResponse toResponse(Guest guest) {
        if (guest == null) {
            return null;
        }

        return GuestResponse.builder()
                .id(guest.getId())
                .firstName(guest.getFirstName())
                .lastName(guest.getLastName())
                .phone(guest.getPhone())
                .email(guest.getEmail())
                .dateOfBirth(guest.getDateOfBirth())
                .idProofType(guest.getIdProofType())
                .idProofNumber(guest.getIdProofNumber())
                .address(guest.getAddress())
                .city(guest.getCity())
                .state(guest.getState())
                .postalCode(guest.getPostalCode())
                .isVerified(guest.getIsVerified())
                .createdBy(guest.getCreatedBy())
                .build();
    }
}