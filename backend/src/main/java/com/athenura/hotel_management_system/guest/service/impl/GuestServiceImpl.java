package com.athenura.hotel_management_system.guest.service.impl;

import com.athenura.hotel_management_system.guest.dto.GuestRequest;
import com.athenura.hotel_management_system.guest.dto.GuestResponse;
import com.athenura.hotel_management_system.guest.dto.VerifyOtpRequest;
import com.athenura.hotel_management_system.guest.entity.Guest;
import com.athenura.hotel_management_system.guest.entity.GuestOtp;
import com.athenura.hotel_management_system.guest.mapper.GuestMapper;
import com.athenura.hotel_management_system.guest.repository.GuestOtpRepository;
import com.athenura.hotel_management_system.guest.repository.GuestRepository;
import com.athenura.hotel_management_system.guest.service.GuestService;
import com.athenura.hotel_management_system.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class GuestServiceImpl implements GuestService {

    private final GuestRepository guestRepository;
    private final GuestOtpRepository guestOtpRepository;
    private final GuestMapper guestMapper;
    private final EmailService emailService;

    @Override
    public boolean checkEmailExists(String email) {
        return guestRepository.existsByEmail(email);
    }

    @Override
    @Transactional
    public String sendOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(900000) + 100000);

        guestOtpRepository.findByEmail(email).ifPresent(existingOtp ->
                guestOtpRepository.deleteByEmail(email)
        );

        GuestOtp guestOtp = GuestOtp.builder()
                .email(email)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .build();

        guestOtpRepository.save(guestOtp);


        emailService.sendGuestRegistrationOtp(email, otp);

        return "OTP sent successfully to " + email;
    }

    @Override
    @Transactional
    public GuestResponse verifyOtpAndGetGuest(VerifyOtpRequest request) {
        GuestOtp guestOtp = guestOtpRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("OTP not found or expired for email: " + request.getEmail()));

        if (guestOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            guestOtpRepository.delete(guestOtp);
            throw new RuntimeException("OTP has expired");
        }

        if (!guestOtp.getOtp().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        guestOtpRepository.delete(guestOtp);

        Guest guest = guestRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Guest not found with email: " + request.getEmail()));

        guest.setIsVerified(true);
        Guest updatedGuest = guestRepository.save(guest);

        return guestMapper.toResponse(updatedGuest);
    }

    @Override
    public GuestResponse createGuest(GuestRequest request) {
        if (guestRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered: " + request.getEmail());
        }

        if (guestRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone number already registered: " + request.getPhone());
        }

        Guest guest = guestMapper.toEntity(request);
        Guest savedGuest = guestRepository.save(guest);

        return guestMapper.toResponse(savedGuest);
    }

    @Override
    public GuestResponse updateGuest(Long id, GuestRequest request) {
        Guest guest = guestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guest not found with id: " + id));

        if (request.getFirstName() != null) guest.setFirstName(request.getFirstName());
        if (request.getLastName() != null) guest.setLastName(request.getLastName());
        if (request.getPhone() != null) guest.setPhone(request.getPhone());
        if (request.getEmail() != null) guest.setEmail(request.getEmail());
        if (request.getIdProofType() != null) guest.setIdProofType(request.getIdProofType());
        if (request.getIdProofNumber() != null) guest.setIdProofNumber(request.getIdProofNumber());
        if (request.getAddress() != null) guest.setAddress(request.getAddress());
        if (request.getCity() != null) guest.setCity(request.getCity());
        if (request.getState() != null) guest.setState(request.getState());
        if (request.getPostalCode() != null) guest.setPostalCode(request.getPostalCode());
        if (request.getDateOfBirth() != null) guest.setDateOfBirth(request.getDateOfBirth());

        Guest updatedGuest = guestRepository.save(guest);
        return guestMapper.toResponse(updatedGuest);
    }

    @Override
    public GuestResponse getGuestById(Long id) {
        Guest guest = guestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guest not found with id: " + id));

        return guestMapper.toResponse(guest);
    }

    @Override
    public GuestResponse getGuestByEmail(String email) {
        Guest guest = guestRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Guest not found with email: " + email));

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
                .orElseThrow(() -> new RuntimeException("Guest not found with id: " + id));

        guestRepository.delete(guest);
        return "Guest with id " + id + " deleted successfully.";
    }
}