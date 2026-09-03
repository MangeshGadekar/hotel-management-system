package com.athenura.hotel_management_system.guest.service.impl;

import com.athenura.hotel_management_system.guest.dto.GuestRequest;
import com.athenura.hotel_management_system.guest.dto.GuestResponse;
import com.athenura.hotel_management_system.guest.entity.Guest;
import com.athenura.hotel_management_system.guest.mapper.GuestMapper;
import com.athenura.hotel_management_system.guest.repository.GuestRepository;
import com.athenura.hotel_management_system.guest.service.GuestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GuestServiceImpl implements GuestService {

    private final GuestRepository guestRepository;
    private final GuestMapper guestMapper;

    @Override
    public GuestResponse createGuest(GuestRequest request) {

        Guest guest = guestMapper.toEntity(request);

        Guest savedGuest = guestRepository.save(guest);

        return guestMapper.toResponse(savedGuest);
    }

    @Override
    public GuestResponse updateGuest(Long id, GuestRequest request) {

        Guest guest = guestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guest not found"));

        if (request.getFirstName() != null) {
            guest.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            guest.setLastName(request.getLastName());
        }

        if (request.getPhone() != null) {
            guest.setPhone(request.getPhone());
        }

        if (request.getEmail() != null) {
            guest.setEmail(request.getEmail());
        }

        if (request.getIdProofType() != null) {
            guest.setIdProofType(request.getIdProofType());
        }

        if (request.getIdProofNumber() != null) {
            guest.setIdProofNumber(request.getIdProofNumber());
        }

        if (request.getAddress() != null) {
            guest.setAddress(request.getAddress());
        }

        if (request.getCity() != null) {
            guest.setCity(request.getCity());
        }

        if (request.getState() != null) {
            guest.setState(request.getState());
        }

        if (request.getPostalCode() != null) {
            guest.setPostalCode(request.getPostalCode());
        }

        Guest updatedGuest = guestRepository.save(guest);

        return guestMapper.toResponse(updatedGuest);
    }

    @Override
    public GuestResponse getGuestById(Long id) {

        Guest guest = guestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guest not found"));

        return guestMapper.toResponse(guest);
    }

    @Override
    public List<GuestResponse> getAllGuests() {

        return guestRepository.findAll()
                .stream()
                .map(guestMapper::toResponse)
                .toList();
    }

    @Override
    public String deleteGuest(Long id) {

        Guest guest = guestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guest not found"));

        guestRepository.delete(guest);

        return "Guest with id " + id + " deleted successfully.";
    }
}