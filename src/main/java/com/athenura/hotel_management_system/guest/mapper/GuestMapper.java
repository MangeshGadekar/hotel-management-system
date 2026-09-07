package com.athenura.hotel_management_system.guest.mapper;

import com.athenura.hotel_management_system.guest.dto.GuestRequest;
import com.athenura.hotel_management_system.guest.dto.GuestResponse;
import com.athenura.hotel_management_system.guest.entity.Guest;
import org.springframework.stereotype.Component;

@Component
public class GuestMapper {

    public Guest toEntity(GuestRequest request) {

        return Guest.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .idProofType(request.getIdProofType())
                .idProofNumber(request.getIdProofNumber())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .build();
    }

    public GuestResponse toResponse(Guest guest) {

        return GuestResponse.builder()
                .id(guest.getId())
                .firstName(guest.getFirstName())
                .lastName(guest.getLastName())
                .phone(guest.getPhone())
                .email(guest.getEmail())
                .idProofType(guest.getIdProofType())
                .idProofNumber(guest.getIdProofNumber())
                .address(guest.getAddress())
                .city(guest.getCity())
                .state(guest.getState())
                .postalCode(guest.getPostalCode())
                .build();
    }
}