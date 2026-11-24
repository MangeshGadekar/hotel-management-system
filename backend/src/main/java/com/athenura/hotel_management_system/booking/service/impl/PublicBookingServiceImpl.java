package com.athenura.hotel_management_system.booking.service.impl;

import com.athenura.hotel_management_system.booking.dto.BookingResponse;
import com.athenura.hotel_management_system.booking.dto.GuestBookingRequest;
import com.athenura.hotel_management_system.booking.dto.GuestBookingResponse;
import com.athenura.hotel_management_system.booking.entity.Booking;
import com.athenura.hotel_management_system.booking.entity.BookingDiscount;
import com.athenura.hotel_management_system.booking.enums.BookingStatus;
import com.athenura.hotel_management_system.booking.mapper.BookingMapper;
import com.athenura.hotel_management_system.booking.repository.BookingDiscountRepository;
import com.athenura.hotel_management_system.booking.repository.BookingRepository;
import com.athenura.hotel_management_system.booking.service.PublicBookingService;
import com.athenura.hotel_management_system.common.exception.BookingOverlapException;
import com.athenura.hotel_management_system.coupon.service.CouponService;
import com.athenura.hotel_management_system.extraservice.entity.ExtraService;
import com.athenura.hotel_management_system.extraservice.enums.ServicePriceType;
import com.athenura.hotel_management_system.extraservice.repository.ExtraServiceRepository;
import com.athenura.hotel_management_system.guest.entity.Guest;
import com.athenura.hotel_management_system.guest.repository.GuestRepository;
import com.athenura.hotel_management_system.notification.service.EmailService;
import com.athenura.hotel_management_system.payment.dto.PaymentDTO;
import com.athenura.hotel_management_system.payment.service.PaymentService;
import com.athenura.hotel_management_system.room.entity.Room;
import com.athenura.hotel_management_system.room.enums.RoomStatus;
import com.athenura.hotel_management_system.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PublicBookingServiceImpl implements PublicBookingService {

    private final BookingRepository bookingRepository;
    private final GuestRepository guestRepository;
    private final RoomRepository roomRepository;
    private final PaymentService paymentService;
    private final ExtraServiceRepository extraServiceRepository;
    private final CouponService couponService;
    private final BookingDiscountRepository bookingDiscountRepository;
    private final EmailService emailNotificationService;
    private final BookingMapper bookingMapper;

    private static final BigDecimal GST_RATE = new BigDecimal("0.18");

    @Override
    @Transactional
    public GuestBookingResponse createPublicBookingOrder(GuestBookingRequest req) {

        if (req.getCheckInDate() == null || req.getCheckOutDate() == null) {
            throw new IllegalArgumentException("Check-in and Check-out dates are required");
        }
        if (!req.getCheckOutDate().isAfter(req.getCheckInDate())) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }

        List<Room> selectedRooms = new ArrayList<>();
        List<BookingStatus> activeStatuses = List.of(BookingStatus.BOOKED, BookingStatus.CHECKED_IN);
        boolean isToday = req.getCheckInDate().isEqual(LocalDate.now());

        if (req.getRoomIds() != null && !req.getRoomIds().isEmpty()) {
            for (Long rId : req.getRoomIds()) {
                Room r = roomRepository.findById(rId)
                        .orElseThrow(() -> new RuntimeException("Room not found with ID: " + rId));
                selectedRooms.add(r);
            }
        } else {
            List<String> targetNumbers = req.resolveRoomNumbers();
            if (targetNumbers == null || targetNumbers.isEmpty()) {
                throw new IllegalArgumentException("At least one room must be selected for booking.");
            }
            for (String rNum : targetNumbers) {
                Room r = roomRepository.findByRoomNumber(rNum)
                        .orElseThrow(() -> new RuntimeException("Room not found: " + rNum));
                selectedRooms.add(r);
            }
        }

        if (selectedRooms.isEmpty()) {
            throw new IllegalArgumentException("No valid rooms resolved for booking.");
        }

        for (Room r : selectedRooms) {
            if (r.getRoomStatus() == RoomStatus.MAINTENANCE) {
                throw new RuntimeException("Room " + r.getRoomNumber() + " is under MAINTENANCE.");
            }

            if (isToday && r.getRoomStatus() != RoomStatus.AVAILABLE) {
                throw new RuntimeException("Room " + r.getRoomNumber() + " is not ready for check-in today.");
            }

            boolean isOverlapping = bookingRepository.existsOverlappingBooking(
                    r.getId(),
                    activeStatuses,
                    req.getCheckInDate(),
                    req.getCheckOutDate()
            );

            if (isOverlapping) {
                throw new BookingOverlapException("Room " + r.getRoomNumber() + " is already booked for these dates.");
            }
        }

        int guestHeadcount = (req.getTotalGuests() != null && req.getTotalGuests() > 0)
                ? req.getTotalGuests()
                : selectedRooms.size() * 2;

        int totalCombinedCapacity = selectedRooms.stream()
                .mapToInt(rm -> rm.getCapacity() != null ? rm.getCapacity() : 2)
                .sum();

        if (guestHeadcount > totalCombinedCapacity) {
            throw new IllegalArgumentException(
                    "Selected rooms accommodate up to " + totalCombinedCapacity + " guests, but entered headcount is " +
                            guestHeadcount + ". Please select an additional room."
            );
        }

        String cleanEmail = req.getEmail().trim().toLowerCase();
        Guest guest = guestRepository.findByEmail(cleanEmail)
                .orElseGet(() -> {
                    Guest newGuest = Guest.builder()
                            .firstName(req.getFirstName().trim())
                            .lastName(req.getLastName().trim())
                            .email(cleanEmail)
                            .phone(req.getPhone() != null ? req.getPhone().trim() : "")
                            .build();
                    return guestRepository.save(newGuest);
                });

        long nights = Math.max(1, ChronoUnit.DAYS.between(req.getCheckInDate(), req.getCheckOutDate()));

        BigDecimal totalRoomCharges = BigDecimal.ZERO;
        for (Room rm : selectedRooms) {
            totalRoomCharges = totalRoomCharges.add(rm.getPricePerNight().multiply(BigDecimal.valueOf(nights)));
        }

        List<ExtraService> selectedServices = new ArrayList<>();
        BigDecimal extraServicesTotal = BigDecimal.ZERO;
        BigDecimal servicesGst = BigDecimal.ZERO;

        if (req.getServiceIds() != null && !req.getServiceIds().isEmpty()) {
            selectedServices = extraServiceRepository.findAllById(req.getServiceIds());
            for (ExtraService service : selectedServices) {
                if (service.getPrice() != null && Boolean.TRUE.equals(service.getActive())) {
                    BigDecimal itemCost = (service.getPriceType() == ServicePriceType.PER_NIGHT)
                            ? service.getPrice().multiply(BigDecimal.valueOf(nights))
                            : service.getPrice();
                    extraServicesTotal = extraServicesTotal.add(itemCost);

                    BigDecimal serviceTaxRate = (service.getTaxRate() != null ? service.getTaxRate() : new BigDecimal("18.00"))
                            .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
                    servicesGst = servicesGst.add(itemCost.multiply(serviceTaxRate).setScale(0, RoundingMode.HALF_UP));
                }
            }
        }

        BigDecimal subtotal = totalRoomCharges.add(extraServicesTotal);
        BigDecimal roomGst = totalRoomCharges.multiply(GST_RATE).setScale(0, RoundingMode.HALF_UP);
        BigDecimal taxAmount = roomGst.add(servicesGst).setScale(0, RoundingMode.HALF_UP);
        BigDecimal grossBeforeDeductions = subtotal.add(taxAmount);

        BigDecimal couponDiscount = BigDecimal.ZERO;
        String couponCode = null;

        if (req.getCouponCode() != null && !req.getCouponCode().trim().isEmpty()) {
            couponCode = req.getCouponCode().trim().toUpperCase();
            couponDiscount = couponService.calculateDiscount(
                    couponCode,
                    totalRoomCharges,
                    selectedRooms.get(0).getRoomType(),
                    "GUEST"
            );
        }

        BigDecimal totalAmount = grossBeforeDeductions.subtract(couponDiscount).max(BigDecimal.ZERO).setScale(0, RoundingMode.HALF_UP);

        Room primaryRoom = selectedRooms.get(0);

        Booking booking = Booking.builder()
                .bookingReference("BOOKING-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .guest(guest)
                .room(primaryRoom)
                .rooms(selectedRooms)
                .checkInDate(req.getCheckInDate())
                .checkOutDate(req.getCheckOutDate())
                .totalGuests(guestHeadcount)
                .roomCharges(totalRoomCharges)
                .extraServicesTotal(extraServicesTotal)
                .subtotal(subtotal)
                .couponCode(couponCode)
                .discountAmount(couponDiscount)
                .taxableAmount(subtotal)
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .advancePayment(BigDecimal.ZERO)
                .balanceDue(totalAmount)
                .bookingStatus(BookingStatus.BOOKED)
                .selectedExtraServices(selectedServices)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        if (couponDiscount.compareTo(BigDecimal.ZERO) > 0) {
            bookingDiscountRepository.save(BookingDiscount.builder()
                    .bookingId(savedBooking.getId())
                    .receiptNumber("REC-ONLINE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .discountSource("COUPON")
                    .discountType("COUPON")
                    .discountValue(couponDiscount)
                    .calculatedAmount(couponDiscount)
                    .reason("Promotional Coupon: " + couponCode)
                    .build());
        }

        PaymentDTO.RazorpayOrderResponse order = paymentService.createRazorpayOrder(savedBooking.getId(), "FULL");

        return GuestBookingResponse.builder()
                .bookingId(savedBooking.getId())
                .razorpayOrderId(order.getOrderId())
                .razorpayKeyId(order.getKeyId())
                .amountToPay(totalAmount)
                .currency("INR")
                .guestEmail(guest.getEmail())
                .guestName(guest.getFirstName() + " " + guest.getLastName())
                .guestPhone(guest.getPhone())
                .build();
    }

    @Override
    @Transactional
    public PaymentDTO.ReceiptResponse verifyPublicBookingPayment(PaymentDTO.RazorpayVerifyRequest request) {

        PaymentDTO.ReceiptResponse receipt = paymentService.verifyRazorpayPayment(request);

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + request.getBookingId()));

        booking.setAdvancePayment(booking.getTotalAmount());
        booking.setBalanceDue(BigDecimal.ZERO);
        booking.setBookingStatus(BookingStatus.BOOKED);

        List<Room> allRooms = (booking.getRooms() != null && !booking.getRooms().isEmpty())
                ? booking.getRooms()
                : (booking.getRoom() != null ? List.of(booking.getRoom()) : List.of());

        for (Room rm : allRooms) {
            rm.setRoomStatus(RoomStatus.RESERVED);
            roomRepository.save(rm);
        }

        bookingRepository.save(booking);

        if (booking.getCouponCode() != null && !booking.getCouponCode().isBlank()) {
            try {
                couponService.incrementUsage(booking.getCouponCode());
            } catch (Exception ex) {
                log.warn("Could not increment coupon usage: {}", ex.getMessage());
            }
        }

        return receipt;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Room> searchAvailableRooms(LocalDate checkIn, LocalDate checkOut, Integer guests) {
        if (checkIn == null || checkOut == null || !checkOut.isAfter(checkIn)) {
            return Collections.emptyList();
        }

        LocalDate today = LocalDate.now();
        boolean isToday = checkIn.isEqual(today);

        List<BookingStatus> activeStatuses = List.of(BookingStatus.BOOKED, BookingStatus.CHECKED_IN);
        List<Long> bookedRoomIds = bookingRepository.findBookedRoomIdsBetweenDates(checkIn, checkOut, activeStatuses);

        final List<Long> excludedIds = (bookedRoomIds != null) ? bookedRoomIds : Collections.emptyList();

        return roomRepository.findAll().stream()
                .filter(room -> room.getRoomStatus() != RoomStatus.MAINTENANCE)
                .filter(room -> !isToday || room.getRoomStatus() == RoomStatus.AVAILABLE)
                .filter(room -> !excludedIds.contains(room.getId()))
                .toList();
    }

    @Override
    @Transactional
    public void sendManageBookingOtp(String bookingIdentifier, String email) {
        if (bookingIdentifier == null || email == null || email.isBlank()) {
            throw new IllegalArgumentException("Booking reference and Email are required");
        }

        String cleanEmail = email.trim().toLowerCase();
        String cleanId = bookingIdentifier.replace("#", "").trim();

        Booking booking = null;
        try {
            Long numericId = Long.parseLong(cleanId);
            booking = bookingRepository.findById(numericId).orElse(null);
        } catch (NumberFormatException ignored) {}

        if (booking == null) {
            booking = bookingRepository.findByBookingReference(cleanId)
                    .orElseThrow(() -> new RuntimeException("No reservation found for reference: " + cleanId));
        }

        if (booking.getGuest() == null || !cleanEmail.equalsIgnoreCase(booking.getGuest().getEmail().trim())) {
            throw new RuntimeException("Email does not match this reservation.");
        }

        int randomOtpNumber = 100000 + new java.security.SecureRandom().nextInt(900000);
        String generatedOtp = String.valueOf(randomOtpNumber);

        booking.setAccessOtp(generatedOtp);
        booking.setAccessOtpExpiresAt(LocalDateTime.now().plusMinutes(5));
        bookingRepository.save(booking);

        emailNotificationService.sendManageBookingAccessOtp(booking, generatedOtp);
    }

    @Override
    @Transactional
    public BookingResponse verifyManageBookingOtp(String bookingIdentifier, String email, String otp) {
        if (bookingIdentifier == null || email == null || otp == null) {
            throw new IllegalArgumentException("Booking reference, Email, and OTP are required");
        }

        String cleanEmail = email.trim().toLowerCase();
        String cleanId = bookingIdentifier.replace("#", "").trim();
        String cleanOtp = otp.trim();

        Booking booking = null;
        try {
            Long numericId = Long.parseLong(cleanId);
            booking = bookingRepository.findById(numericId).orElse(null);
        } catch (NumberFormatException ignored) {}

        if (booking == null) {
            booking = bookingRepository.findByBookingReference(cleanId)
                    .orElseThrow(() -> new RuntimeException("Reservation not found for reference: " + cleanId));
        }

        if (booking.getGuest() == null || !cleanEmail.equalsIgnoreCase(booking.getGuest().getEmail().trim())) {
            throw new RuntimeException("Email does not match this reservation.");
        }

        if (booking.getAccessOtp() == null || !booking.getAccessOtp().equals(cleanOtp)) {
            throw new RuntimeException("Invalid verification code. Please check your email.");
        }

        if (booking.getAccessOtpExpiresAt() != null && LocalDateTime.now().isAfter(booking.getAccessOtpExpiresAt())) {
            booking.setAccessOtp(null);
            booking.setAccessOtpExpiresAt(null);
            bookingRepository.save(booking);
            throw new RuntimeException("Verification code has expired.");
        }

        booking.setAccessOtp(null);
        booking.setAccessOtpExpiresAt(null);
        bookingRepository.save(booking);

        List<BookingDiscount> discounts = bookingDiscountRepository.findByBookingId(booking.getId());
        return bookingMapper.toResponse(booking, discounts);
    }

    @Override
    @Transactional(readOnly = true)
    public void validateGuestBookingOwnership(Long bookingId, String email) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));

        if (booking.getGuest() == null || !email.trim().equalsIgnoreCase(booking.getGuest().getEmail().trim())) {
            throw new RuntimeException("You are not authorized to cancel this booking.");
        }
    }
}