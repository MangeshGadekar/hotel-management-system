package com.athenura.hotel_management_system.guest.service;

import com.athenura.hotel_management_system.guest.dto.GuestRequest;
import com.athenura.hotel_management_system.guest.dto.GuestResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface GuestService {

    GuestResponse createGuest(GuestRequest request);

    GuestResponse updateGuest(Long id, GuestRequest request);

    GuestResponse getGuestById(Long id);

    List<GuestResponse> getAllGuests();

    String deleteGuest(Long id);
}