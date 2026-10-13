package com.athenura.hotel_management_system.guest.service.impl;

import com.athenura.hotel_management_system.common.entity.Users;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GuestServiceImpl implements GuestService {

    private final GuestRepository guestRepository;
    private final GuestOtpRepository guestOtpRepository;
    private final GuestMapper guestMapper;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    private String getCreatedByName() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {

            Object principal = authentication.getPrincipal();

            if (principal instanceof Users user) {
                String role = user.getRole() != null ? user.getRole().name() : "";

                if ("ADMIN".equalsIgnoreCase(role)) {
                    return "Admin";
                } else if ("RECEPTIONIST".equalsIgnoreCase(role)) {
                    String fullName = (user.getFirstName() != null ? user.getFirstName() : "")
                            + (user.getLastName() != null ? " " + user.getLastName() : "");

                    return fullName.isBlank() ? user.getEmail() : fullName.trim();
                }
            }
        }

        return "Online";
    }

    @Override
    public boolean checkEmailExists(String email) {
        if (email == null || email.isBlank()) {
            return false;
        }
        return guestRepository.existsByEmailIgnoreCase(email.trim().toLowerCase());
    }

    @Override
    public List<GuestResponse> searchGuestsByEmail(String query) {
        if (query == null || query.trim().length() < 2) {
            return Collections.emptyList();
        }
        return guestRepository.searchByEmailQuery(query.trim().toLowerCase())
                .stream()
                .map(guestMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public String sendOtp(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email cannot be empty");
        }

        String cleanEmail = email.trim().toLowerCase();

        int randomOtpNumber = 100000 + secureRandom.nextInt(900000);
        String otp = String.valueOf(randomOtpNumber);

        guestOtpRepository.deleteByEmailIgnoreCase(cleanEmail);

        GuestOtp guestOtp = GuestOtp.builder()
                .email(cleanEmail)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .build();

        guestOtpRepository.save(guestOtp);

        emailService.sendGuestRegistrationOtp(cleanEmail, otp);

        return "OTP sent successfully to " + cleanEmail;
    }

    @Override
    @Transactional
    public GuestResponse verifyOtpAndSaveOrUpdateGuest(VerifyOtpRequest request) {
        if (request == null || request.getEmail() == null || request.getOtp() == null) {
            throw new IllegalArgumentException("Email and OTP are required");
        }

        String cleanEmail = request.getEmail().trim().toLowerCase();

        GuestOtp guestOtp = guestOtpRepository.findByEmailIgnoreCase(cleanEmail)
                .orElseThrow(() -> new RuntimeException("OTP not found or expired for email: " + cleanEmail));

        if (guestOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            guestOtpRepository.delete(guestOtp);
            throw new RuntimeException("OTP has expired");
        }

        if (!guestOtp.getOtp().equals(request.getOtp().trim())) {
            throw new RuntimeException("Invalid OTP");
        }

        guestOtpRepository.delete(guestOtp);

        GuestRequest dto = request.getGuestData();
        Guest guest = guestRepository.findByEmailIgnoreCase(cleanEmail).orElse(null);

        if (guest != null) {
            if (dto != null) {
                if (dto.getPhone() != null && !dto.getPhone().equals(guest.getPhone())) {
                    if (guestRepository.existsByPhone(dto.getPhone())) {
                        throw new RuntimeException("Phone number already associated with another guest: " + dto.getPhone());
                    }
                    guest.setPhone(dto.getPhone());
                }

                if (dto.getFirstName() != null) guest.setFirstName(dto.getFirstName());
                if (dto.getLastName() != null) guest.setLastName(dto.getLastName());
                if (dto.getIdProofType() != null) guest.setIdProofType(dto.getIdProofType());
                if (dto.getIdProofNumber() != null) guest.setIdProofNumber(dto.getIdProofNumber());
                if (dto.getAddress() != null) guest.setAddress(dto.getAddress());
                if (dto.getCity() != null) guest.setCity(dto.getCity());
                if (dto.getState() != null) guest.setState(dto.getState());
                if (dto.getPostalCode() != null) guest.setPostalCode(dto.getPostalCode());
                if (dto.getDateOfBirth() != null) guest.setDateOfBirth(dto.getDateOfBirth());
            }
            guest.setIsVerified(true);
            return guestMapper.toResponse(guestRepository.save(guest));
        } else {
            if (dto == null) {
                throw new RuntimeException("Guest data is required for new registration");
            }

            if (dto.getPhone() != null && guestRepository.existsByPhone(dto.getPhone())) {
                throw new RuntimeException("Phone number already registered: " + dto.getPhone());
            }

            Guest newGuest = guestMapper.toEntity(dto);
            newGuest.setEmail(cleanEmail);
            newGuest.setIsVerified(true);
            newGuest.setCreatedBy(getCreatedByName());

            return guestMapper.toResponse(guestRepository.save(newGuest));
        }
    }

    @Override
    @Transactional
    public GuestResponse createGuest(GuestRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();

        if (guestRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new RuntimeException("Email already registered: " + cleanEmail);
        }

        if (request.getPhone() != null && guestRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone number already registered: " + request.getPhone());
        }

        Guest guest = guestMapper.toEntity(request);
        guest.setEmail(cleanEmail);
        guest.setCreatedBy(getCreatedByName());

        Guest savedGuest = guestRepository.save(guest);

        return guestMapper.toResponse(savedGuest);
    }

    @Override
    @Transactional
    public GuestResponse updateGuest(Long id, GuestRequest request) {
        Guest guest = guestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guest not found with id: " + id));

        if (request.getPhone() != null && !request.getPhone().equals(guest.getPhone())) {
            if (guestRepository.existsByPhone(request.getPhone())) {
                throw new RuntimeException("Phone number already associated with another guest: " + request.getPhone());
            }
            guest.setPhone(request.getPhone());
        }

        if (request.getEmail() != null) {
            String cleanEmail = request.getEmail().trim().toLowerCase();
            if (!cleanEmail.equals(guest.getEmail()) && guestRepository.existsByEmailIgnoreCase(cleanEmail)) {
                throw new RuntimeException("Email already registered: " + cleanEmail);
            }
            guest.setEmail(cleanEmail);
        }

        if (request.getFirstName() != null) guest.setFirstName(request.getFirstName());
        if (request.getLastName() != null) guest.setLastName(request.getLastName());
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
        Guest guest = guestRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
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
    @Transactional
    public String deleteGuest(Long id) {
        Guest guest = guestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guest not found with id: " + id));

        guestRepository.delete(guest);
        return "Guest with id " + id + " deleted successfully.";
    }
}