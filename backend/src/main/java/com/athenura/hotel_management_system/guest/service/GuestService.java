package com.athenura.hotel_management_system.guest.service;

import com.athenura.hotel_management_system.guest.dto.GuestRequest;
import com.athenura.hotel_management_system.guest.dto.GuestResponse;
import com.athenura.hotel_management_system.guest.dto.VerifyOtpRequest;

import java.util.List;

public interface GuestService {
    boolean checkEmailExists(String email);
    List<GuestResponse> searchGuestsByEmail(String query);
    String sendOtp(String email);
    GuestResponse verifyOtpAndSaveOrUpdateGuest(VerifyOtpRequest request);
    GuestResponse createGuest(GuestRequest request);
    GuestResponse updateGuest(Long id, GuestRequest request);
    GuestResponse getGuestById(Long id);
    GuestResponse getGuestByEmail(String email);
    List<GuestResponse> getAllGuests();
    String deleteGuest(Long id);
}