package com.athenura.hotel_management_system.booking.service.impl;

import com.athenura.hotel_management_system.booking.dto.*;
import com.athenura.hotel_management_system.booking.entity.Booking;
import com.athenura.hotel_management_system.booking.entity.BookingDiscount;
import com.athenura.hotel_management_system.booking.enums.BookingStatus;
import com.athenura.hotel_management_system.booking.mapper.BookingMapper;
import com.athenura.hotel_management_system.booking.repository.BookingDiscountRepository;
import com.athenura.hotel_management_system.booking.repository.BookingRepository;
import com.athenura.hotel_management_system.booking.service.BookingService;
import com.athenura.hotel_management_system.booking.service.MasterReceiptPdfService;
import com.athenura.hotel_management_system.common.entity.Users;
import com.athenura.hotel_management_system.common.exception.BookingOverlapException;
import com.athenura.hotel_management_system.common.repository.UserRepo;
import com.athenura.hotel_management_system.coupon.service.CouponService;
import com.athenura.hotel_management_system.extraservice.entity.ExtraService;
import com.athenura.hotel_management_system.extraservice.enums.ServicePriceType;
import com.athenura.hotel_management_system.extraservice.repository.ExtraServiceRepository;
import com.athenura.hotel_management_system.guest.entity.Guest;
import com.athenura.hotel_management_system.guest.repository.GuestRepository;
import com.athenura.hotel_management_system.notification.service.EmailService;
import com.athenura.hotel_management_system.payment.dto.PaymentDTO;
import com.athenura.hotel_management_system.payment.entity.Payment;
import com.athenura.hotel_management_system.payment.repository.PaymentRepository;
import com.athenura.hotel_management_system.payment.service.PaymentService;
import com.athenura.hotel_management_system.room.entity.Room;
import com.athenura.hotel_management_system.room.enums.RoomStatus;
import com.athenura.hotel_management_system.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final GuestRepository guestRepository;
    private final RoomRepository roomRepository;
    private final PaymentRepository paymentRepository;
    private final BookingMapper bookingMapper;
    private final PaymentService paymentService;
    private final ExtraServiceRepository extraServiceRepository;
    private final CouponService couponService;
    private final BookingDiscountRepository bookingDiscountRepository;
    private final MasterReceiptPdfService masterReceiptPdfService;
    private final EmailService emailService;
    private final UserRepo userRepo;

    private static final BigDecimal GST_RATE = new BigDecimal("0.18");

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        return createBooking(request, null);
    }

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request, String staffEmail) {

        // 1. Validate dates
        if (!request.getCheckOutDate().isAfter(request.getCheckInDate())) {
            throw new RuntimeException("Check-out date must be after check-in date");
        }

        // 2. Resolve and validate all assigned rooms
        List<Long> targetRoomIds = request.resolveRoomIds();
        if (targetRoomIds.isEmpty()) {
            throw new RuntimeException("At least one Room must be selected.");
        }

        List<Room> assignedRooms = new ArrayList<>();
        List<BookingStatus> activeStatuses = List.of(BookingStatus.BOOKED, BookingStatus.CHECKED_IN);
        boolean isToday = request.getCheckInDate().isEqual(LocalDate.now());

        for (Long rId : targetRoomIds) {
            Room rm = roomRepository.findById(rId)
                    .orElseThrow(() -> new RuntimeException("Room not found with ID: " + rId));

            if (rm.getRoomStatus() == RoomStatus.MAINTENANCE) {
                throw new RuntimeException("Room " + rm.getRoomNumber() + " is under MAINTENANCE.");
            }

            if (isToday && rm.getRoomStatus() != RoomStatus.AVAILABLE) {
                throw new RuntimeException("Room " + rm.getRoomNumber() + " is not ready for check-in today.");
            }

            boolean isOverlapping = bookingRepository.existsOverlappingBooking(
                    rm.getId(),
                    activeStatuses,
                    request.getCheckInDate(),
                    request.getCheckOutDate()
            );

            if (isOverlapping) {
                throw new BookingOverlapException("Room " + rm.getRoomNumber() + " is already booked for these dates.");
            }
            assignedRooms.add(rm);
        }

        // 3. Guest Count Validation
        int guestHeadcount = (request.getTotalGuests() != null && request.getTotalGuests() > 0)
                ? request.getTotalGuests()
                : assignedRooms.size() * 2;

        int totalCombinedCapacity = assignedRooms.stream()
                .mapToInt(rm -> rm.getCapacity() != null ? rm.getCapacity() : 2)
                .sum();

        if (guestHeadcount > totalCombinedCapacity) {
            throw new IllegalArgumentException(
                    "Selected rooms hold up to " + totalCombinedCapacity + " guests, but entered headcount is " +
                            guestHeadcount + ". Please select another room."
            );
        }

        // 4. Create or fetch Guest
        Guest guest;
        if (request.getGuestId() != null) {
            guest = guestRepository.findById(request.getGuestId())
                    .orElseThrow(() -> new RuntimeException("Guest not found with ID: " + request.getGuestId()));
        } else if (request.getGuest() != null && request.getGuest().getEmail() != null) {
            String incomingEmail = request.getGuest().getEmail().trim().toLowerCase();
            guest = guestRepository.findByEmail(incomingEmail)
                    .orElseGet(() -> {
                        Guest newGuest = Guest.builder()
                                .firstName(request.getGuest().getFirstName())
                                .lastName(request.getGuest().getLastName())
                                .phone(request.getGuest().getPhone())
                                .email(incomingEmail)
                                .idProofType(request.getGuest().getIdProofType())
                                .idProofNumber(request.getGuest().getIdProofNumber())
                                .address(request.getGuest().getAddress())
                                .city(request.getGuest().getCity())
                                .state(request.getGuest().getState())
                                .postalCode(request.getGuest().getPostalCode())
                                .build();
                        return guestRepository.save(newGuest);
                    });
        } else {
            throw new RuntimeException("Guest details or guestId required");
        }

        Users staffUser = (staffEmail != null && !staffEmail.isBlank())
                ? userRepo.findByEmail(staffEmail).orElse(null)
                : null;

        // 5. Calculate nights & room charges
        long nights = Math.max(1, ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate()));

        BigDecimal totalRoomCharges = BigDecimal.ZERO;
        for (Room rm : assignedRooms) {
            totalRoomCharges = totalRoomCharges.add(rm.getPricePerNight().multiply(BigDecimal.valueOf(nights)));
        }

        // 6. Selected Extra-Services
        List<ExtraService> selectedServices = new ArrayList<>();
        BigDecimal extraServicesTotal = BigDecimal.ZERO;
        BigDecimal servicesGst = BigDecimal.ZERO;

        if (request.getExtraServiceIds() != null && !request.getExtraServiceIds().isEmpty()) {
            selectedServices = extraServiceRepository.findAllById(request.getExtraServiceIds());
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

        // 7. Coupon Deductions
        BigDecimal couponDiscount = BigDecimal.ZERO;
        String couponCode = null;

        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            couponCode = request.getCouponCode().trim().toUpperCase();
            couponDiscount = couponService.calculateDiscount(couponCode, totalRoomCharges, assignedRooms.get(0).getRoomType(), "RECEPTIONIST");
            couponService.incrementUsage(couponCode);
        }

        BigDecimal manualDiscountInput = request.getCustomDiscount();
        String discountType = request.getCustomDiscountType();
        BigDecimal deskDiscount = BigDecimal.ZERO;

        if (manualDiscountInput != null && manualDiscountInput.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal eligibleBase = grossBeforeDeductions.subtract(couponDiscount).max(BigDecimal.ZERO);
            if ("PERCENT".equalsIgnoreCase(discountType)) {
                BigDecimal percent = manualDiscountInput.min(new BigDecimal("100.00")).max(BigDecimal.ZERO);
                deskDiscount = eligibleBase.multiply(percent).divide(new BigDecimal("100.00"), 0, RoundingMode.HALF_UP);
            } else {
                deskDiscount = manualDiscountInput.min(eligibleBase);
            }
        }

        BigDecimal discountAmount = couponDiscount.add(deskDiscount);
        BigDecimal totalAmount = grossBeforeDeductions.subtract(discountAmount).max(BigDecimal.ZERO).setScale(0, RoundingMode.HALF_UP);

        BigDecimal advancePayment = BigDecimal.ZERO;
        if (request.getAmount() != null && request.getAmount().compareTo(BigDecimal.ZERO) > 0) {
            advancePayment = request.getAmount();
        } else if ("SPLIT_ADVANCE".equalsIgnoreCase(request.getPaymentType())) {
            advancePayment = totalAmount.multiply(new BigDecimal("0.40")).setScale(0, RoundingMode.HALF_UP);
        } else if ("FULL".equalsIgnoreCase(request.getPaymentType())) {
            advancePayment = totalAmount.setScale(0, RoundingMode.HALF_UP);
        }

        BigDecimal balanceDue = totalAmount.subtract(advancePayment).max(BigDecimal.ZERO);

        // 8. Save Booking
        Room primaryRoom = assignedRooms.get(0);

        Booking booking = Booking.builder()
                .bookingReference("BOOKING-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .guest(guest)
                .room(primaryRoom)
                .rooms(assignedRooms)
                .receptionist(staffUser)
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .totalGuests(guestHeadcount)
                .roomCharges(totalRoomCharges)
                .extraServicesTotal(extraServicesTotal)
                .subtotal(subtotal)
                .couponCode(couponCode)
                .discountAmount(discountAmount)
                .discountReason(request.getDiscountReason())
                .taxableAmount(subtotal)
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .advancePayment(advancePayment)
                .balanceDue(balanceDue)
                .bookingStatus(BookingStatus.BOOKED)
                .selectedExtraServices(selectedServices)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        for (Room rm : assignedRooms) {
            rm.setRoomStatus(RoomStatus.RESERVED);
            roomRepository.save(rm);
        }

        String initialReceiptNumber = "REC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        if (couponDiscount.compareTo(BigDecimal.ZERO) > 0) {
            bookingDiscountRepository.save(BookingDiscount.builder()
                    .bookingId(savedBooking.getId())
                    .receiptNumber(initialReceiptNumber)
                    .discountSource("COUPON")
                    .discountType("COUPON")
                    .discountValue(couponDiscount)
                    .calculatedAmount(couponDiscount)
                    .reason("Promotional Coupon: " + couponCode)
                    .build());
        }

        if (deskDiscount.compareTo(BigDecimal.ZERO) > 0) {
            bookingDiscountRepository.save(BookingDiscount.builder()
                    .bookingId(savedBooking.getId())
                    .receiptNumber(initialReceiptNumber)
                    .discountSource("DESK_CONCESSION")
                    .discountType(request.getCustomDiscountType() != null ? request.getCustomDiscountType() : "FLAT")
                    .discountValue(manualDiscountInput)
                    .calculatedAmount(deskDiscount)
                    .reason(request.getDiscountReason() != null ? request.getDiscountReason().trim() : "Desk Concession")
                    .build());
        }

        if (advancePayment.compareTo(BigDecimal.ZERO) > 0 && request.getPaymentMethod() != null) {
            paymentService.processPayment(
                    PaymentDTO.PaymentRequest.builder()
                            .bookingId(savedBooking.getId())
                            .receiptNumber(initialReceiptNumber)
                            .paymentType(request.getPaymentType() != null ? request.getPaymentType() : "SPLIT_ADVANCE")
                            .paymentMethod(request.getPaymentMethod())
                            .transactionReference("CARD_MACHINE".equalsIgnoreCase(request.getPaymentMethod())
                                    ? request.getTransactionReference()
                                    : null)
                            .amount(advancePayment)
                            .settledItems("Initial Booking Advance Deposit")
                            .grossAmount(grossBeforeDeductions)
                            .couponDeducted(couponDiscount)
                            .discountDeducted(deskDiscount)
                            .amountPaid(advancePayment)
                            .balanceRemaining(balanceDue)
                            .build()
            );
        }

        return enrichWithLedger(savedBooking);
    }

    @Override
    @Transactional
    public BookingResponse checkInGuest(Long bookingId, String staffEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Cannot check-in a cancelled reservation.");
        }
        if (booking.getBookingStatus() == BookingStatus.CHECKED_IN) {
            throw new RuntimeException("Guest is already checked in.");
        }

        booking.setBookingStatus(BookingStatus.CHECKED_IN);

        List<Room> activeRooms = (booking.getRooms() != null && !booking.getRooms().isEmpty())
                ? booking.getRooms()
                : (booking.getRoom() != null ? List.of(booking.getRoom()) : List.of());

        for (Room rm : activeRooms) {
            rm.setRoomStatus(RoomStatus.OCCUPIED);
            roomRepository.save(rm);
        }

        Booking updated = bookingRepository.save(booking);

        try {
            String staffName = resolveStaffName(null, staffEmail);
            byte[] pdfBytes = masterReceiptPdfService.generateCheckInReceipt(updated, staffName);
            emailService.sendBookingConfirmationWithReceipt(updated, pdfBytes);
        } catch (Exception e) {
            log.error("Receipt generation or email delivery failed for booking #{}: {}", bookingId, e.getMessage());
        }

        return enrichWithLedger(updated);
    }

    @Override
    @Transactional
    public BookingResponse checkInGuest(Long bookingId) {
        return checkInGuest(bookingId, null);
    }

    @Override
    @Transactional
    public BookingResponse checkOutGuest(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));

        if (booking.getBookingStatus() != BookingStatus.CHECKED_IN) {
            throw new RuntimeException("Only checked-in reservations can be checked out.");
        }

        if (booking.getBalanceDue() != null && booking.getBalanceDue().compareTo(BigDecimal.ZERO) > 0) {
            throw new RuntimeException("Cannot check out. Pending balance due: ₹" + booking.getBalanceDue());
        }

        booking.setBookingStatus(BookingStatus.CHECKED_OUT);

        List<Room> activeRooms = (booking.getRooms() != null && !booking.getRooms().isEmpty())
                ? booking.getRooms()
                : (booking.getRoom() != null ? List.of(booking.getRoom()) : List.of());

        for (Room rm : activeRooms) {
            rm.setRoomStatus(RoomStatus.CLEANING);
            roomRepository.save(rm);
        }

        Booking savedBooking = bookingRepository.saveAndFlush(booking);
        return enrichWithLedger(savedBooking);
    }

    @Override
    @Transactional
    public String cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + id));

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking #" + id + " is already cancelled.");
        }

        booking.setAdvancePayment(BigDecimal.ZERO);
        booking.setBalanceDue(BigDecimal.ZERO);
        booking.setBookingStatus(BookingStatus.CANCELLED);

        List<Room> activeRooms = (booking.getRooms() != null && !booking.getRooms().isEmpty())
                ? booking.getRooms()
                : (booking.getRoom() != null ? List.of(booking.getRoom()) : List.of());

        for (Room rm : activeRooms) {
            rm.setRoomStatus(RoomStatus.AVAILABLE);
            roomRepository.save(rm);
        }

        bookingRepository.saveAndFlush(booking);
        paymentService.processRefundForBookingWithPolicy(booking.getId(), BigDecimal.ONE);

        return "Booking #" + id + " successfully cancelled.";
    }

    @Override
    public BookingResponse getBookingById(Long id) {
        return enrichWithLedger(bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found")));
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream().map(this::enrichWithLedger).toList();
    }

    @Override
    @Transactional
    public BookingResponse updateBooking(Long id, BookingRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (request.getCheckInDate() != null) booking.setCheckInDate(request.getCheckInDate());
        if (request.getCheckOutDate() != null) booking.setCheckOutDate(request.getCheckOutDate());
        if (request.getTotalGuests() != null) booking.setTotalGuests(request.getTotalGuests());

        return enrichWithLedger(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public BookingResponse addExtraServicesToBooking(Long bookingId, List<Long> extraServiceIds) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Cannot add services to a cancelled booking.");
        }

        long nights = Math.max(1, ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate()));
        List<ExtraService> catalogList = extraServiceRepository.findAllById(extraServiceIds);

        BigDecimal addedCharges = BigDecimal.ZERO;
        BigDecimal addedTax = BigDecimal.ZERO;
        List<ExtraService> savedInstances = new ArrayList<>();

        for (ExtraService catalogItem : catalogList) {
            if (Boolean.TRUE.equals(catalogItem.getActive()) && catalogItem.getPrice() != null) {
                BigDecimal itemCost = (catalogItem.getPriceType() == ServicePriceType.PER_NIGHT)
                        ? catalogItem.getPrice().multiply(BigDecimal.valueOf(nights))
                        : catalogItem.getPrice();

                BigDecimal taxRate = (catalogItem.getTaxRate() != null ? catalogItem.getTaxRate() : new BigDecimal("18.00"))
                        .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
                BigDecimal itemTax = itemCost.multiply(taxRate).setScale(0, RoundingMode.HALF_UP);

                addedCharges = addedCharges.add(itemCost);
                addedTax = addedTax.add(itemTax);

                ExtraService instance = ExtraService.builder()
                        .name(catalogItem.getName())
                        .description(catalogItem.getDescription())
                        .price(itemCost)
                        .priceType(catalogItem.getPriceType())
                        .availability(catalogItem.getAvailability())
                        .taxRate(catalogItem.getTaxRate() != null ? catalogItem.getTaxRate() : new BigDecimal("18.00"))
                        .category(catalogItem.getCategory())
                        .bookingId(booking.getId())
                        .active(false)
                        .paid(false)
                        .build();

                savedInstances.add(extraServiceRepository.save(instance));
            }
        }

        if (booking.getSelectedExtraServices() == null) booking.setSelectedExtraServices(new ArrayList<>());
        booking.getSelectedExtraServices().addAll(savedInstances);

        booking.setExtraServicesTotal((booking.getExtraServicesTotal() != null ? booking.getExtraServicesTotal() : BigDecimal.ZERO).add(addedCharges));
        booking.setSubtotal((booking.getSubtotal() != null ? booking.getSubtotal() : BigDecimal.ZERO).add(addedCharges));
        booking.setTaxableAmount((booking.getTaxableAmount() != null ? booking.getTaxableAmount() : BigDecimal.ZERO).add(addedCharges));
        booking.setTaxAmount((booking.getTaxAmount() != null ? booking.getTaxAmount() : BigDecimal.ZERO).add(addedTax));
        booking.setTotalAmount((booking.getTotalAmount() != null ? booking.getTotalAmount() : BigDecimal.ZERO).add(addedCharges.add(addedTax)));
        booking.setBalanceDue((booking.getBalanceDue() != null ? booking.getBalanceDue() : BigDecimal.ZERO).add(addedCharges.add(addedTax)));

        return enrichWithLedger(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public BookingResponse addCustomServiceToBooking(Long bookingId, CustomServiceRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));

        BigDecimal price = request.getPrice();
        BigDecimal taxRatePercent = request.getTaxRate() != null ? request.getTaxRate() : new BigDecimal("18.00");
        BigDecimal addedTax = price.multiply(taxRatePercent.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)).setScale(0, RoundingMode.HALF_UP);

        ExtraService customService = ExtraService.builder()
                .name(request.getServiceName() != null ? request.getServiceName() : "Custom Service")
                .description("Custom Service")
                .price(price)
                .priceType(ServicePriceType.PER_STAY)
                .taxRate(taxRatePercent)
                .category("Room Add-on")
                .bookingId(booking.getId())
                .active(false)
                .paid(false)
                .build();

        ExtraService saved = extraServiceRepository.save(customService);
        if (booking.getSelectedExtraServices() == null) booking.setSelectedExtraServices(new ArrayList<>());
        booking.getSelectedExtraServices().add(saved);

        booking.setExtraServicesTotal((booking.getExtraServicesTotal() != null ? booking.getExtraServicesTotal() : BigDecimal.ZERO).add(price));
        booking.setSubtotal((booking.getSubtotal() != null ? booking.getSubtotal() : BigDecimal.ZERO).add(price));
        booking.setTaxableAmount((booking.getTaxableAmount() != null ? booking.getTaxableAmount() : BigDecimal.ZERO).add(price));
        booking.setTaxAmount((booking.getTaxAmount() != null ? booking.getTaxAmount() : BigDecimal.ZERO).add(addedTax));
        booking.setTotalAmount((booking.getTotalAmount() != null ? booking.getTotalAmount() : BigDecimal.ZERO).add(price.add(addedTax)));
        booking.setBalanceDue((booking.getBalanceDue() != null ? booking.getBalanceDue() : BigDecimal.ZERO).add(price.add(addedTax)));

        return enrichWithLedger(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public BookingResponse removeExtraServiceFromBooking(Long bookingId, Long extraServiceId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));

        List<ExtraService> services = booking.getSelectedExtraServices();
        if (services == null) throw new RuntimeException("No services on this booking");

        ExtraService toRemove = services.stream().filter(s -> s.getId().equals(extraServiceId)).findFirst()
                .orElseThrow(() -> new RuntimeException("Service not found"));

        BigDecimal taxRate = (toRemove.getTaxRate() != null ? toRemove.getTaxRate() : new BigDecimal("18.00"))
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal itemTax = toRemove.getPrice().multiply(taxRate).setScale(0, RoundingMode.HALF_UP);
        BigDecimal itemTotal = toRemove.getPrice().add(itemTax);

        services.remove(toRemove);
        booking.setExtraServicesTotal(booking.getExtraServicesTotal().subtract(toRemove.getPrice()));
        booking.setSubtotal(booking.getSubtotal().subtract(toRemove.getPrice()));
        booking.setTaxableAmount(booking.getTaxableAmount().subtract(toRemove.getPrice()));
        booking.setTaxAmount(booking.getTaxAmount().subtract(itemTax));
        booking.setTotalAmount(booking.getTotalAmount().subtract(itemTotal));
        booking.setBalanceDue(booking.getBalanceDue().subtract(itemTotal));

        return enrichWithLedger(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public BookingResponse applyPostBookingDiscount(Long bookingId, BigDecimal discountValue, String discountType, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));

        BigDecimal currentBalance = booking.getBalanceDue() != null ? booking.getBalanceDue() : BigDecimal.ZERO;
        BigDecimal additionalDiscount = "PERCENT".equalsIgnoreCase(discountType)
                ? currentBalance.multiply(discountValue.min(new BigDecimal("100"))).divide(new BigDecimal("100"), 0, RoundingMode.HALF_UP)
                : discountValue.min(currentBalance);

        bookingDiscountRepository.save(BookingDiscount.builder()
                .bookingId(booking.getId())
                .discountSource("DESK_CONCESSION")
                .discountType(discountType)
                .discountValue(discountValue)
                .calculatedAmount(additionalDiscount)
                .reason(reason != null && !reason.trim().isEmpty() ? reason.trim() : "Front Desk Discount")
                .build());

        booking.setDiscountAmount((booking.getDiscountAmount() != null ? booking.getDiscountAmount() : BigDecimal.ZERO).add(additionalDiscount));
        booking.setBalanceDue(currentBalance.subtract(additionalDiscount).max(BigDecimal.ZERO));
        booking.setTotalAmount(booking.getTotalAmount().subtract(additionalDiscount).max(BigDecimal.ZERO));

        return enrichWithLedger(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public BookingResponse settlePartialServicePayment(Long bookingId, List<Long> serviceIdsToPay, BigDecimal paymentAmount, String paymentMethod) {
        return settlePartialServicePayment(bookingId, serviceIdsToPay, paymentAmount, paymentMethod, BigDecimal.ZERO, null);
    }

    @Override
    @Transactional
    public BookingResponse settlePartialServicePayment(Long bookingId, List<Long> serviceIdsToPay, BigDecimal paymentAmount, String paymentMethod, BigDecimal discountAmount, String discountReason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));

        String settlementReceiptNumber = "REC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        BigDecimal disc = discountAmount != null ? discountAmount : BigDecimal.ZERO;

        if (disc.compareTo(BigDecimal.ZERO) > 0) {
            bookingDiscountRepository.save(BookingDiscount.builder()
                    .bookingId(booking.getId())
                    .receiptNumber(settlementReceiptNumber)
                    .discountSource("DESK_CONCESSION")
                    .discountType("FLAT")
                    .discountValue(disc)
                    .calculatedAmount(disc)
                    .reason(discountReason != null ? discountReason : "Settlement Concession")
                    .build());
            booking.setDiscountAmount((booking.getDiscountAmount() != null ? booking.getDiscountAmount() : BigDecimal.ZERO).add(disc));
        }

        if (serviceIdsToPay != null && booking.getSelectedExtraServices() != null) {
            for (ExtraService s : booking.getSelectedExtraServices()) {
                if (serviceIdsToPay.contains(s.getId())) {
                    s.setPaid(true);
                    extraServiceRepository.save(s);
                }
            }
        }

        BigDecimal currentDue = booking.getBalanceDue() != null ? booking.getBalanceDue() : BigDecimal.ZERO;
        BigDecimal newRemainingBalance = currentDue.subtract(paymentAmount).subtract(disc).max(BigDecimal.ZERO);

        paymentService.processPayment(
                PaymentDTO.PaymentRequest.builder()
                        .bookingId(booking.getId())
                        .receiptNumber(settlementReceiptNumber)
                        .paymentType("SERVICE_SETTLEMENT")
                        .paymentMethod(paymentMethod != null ? paymentMethod : "CASH")
                        .amount(paymentAmount)
                        .settledItems("Stay & Add-on Settlement")
                        .grossAmount(paymentAmount.add(disc))
                        .discountDeducted(disc)
                        .amountPaid(paymentAmount)
                        .balanceRemaining(newRemainingBalance)
                        .build()
        );

        booking.setAdvancePayment((booking.getAdvancePayment() != null ? booking.getAdvancePayment() : BigDecimal.ZERO).add(paymentAmount));
        booking.setBalanceDue(newRemainingBalance);
        booking.setTotalAmount(booking.getTotalAmount().subtract(disc).max(BigDecimal.ZERO));

        return enrichWithLedger(bookingRepository.save(booking));
    }

    @Override
    @Transactional(readOnly = true)
    public BookingSettlementResponse getSettlementBreakdown(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));

        return BookingSettlementResponse.builder()
                .bookingId(booking.getId())
                .totalBill(booking.getTotalAmount())
                .totalPaid(booking.getAdvancePayment())
                .balanceDue(booking.getBalanceDue())
                .discountAmount(booking.getDiscountAmount())
                .pendingRoomBalance(booking.getBalanceDue())
                .pendingItems(Collections.emptyList())
                .build();
    }

    @Override
    @Transactional
    public BookingResponse extendStay(Long bookingId, LocalDate newCheckOutDate) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));

        List<Room> allRooms = (booking.getRooms() != null && !booking.getRooms().isEmpty())
                ? booking.getRooms()
                : (booking.getRoom() != null ? List.of(booking.getRoom()) : List.of());

        List<BookingStatus> activeStatuses = List.of(BookingStatus.BOOKED, BookingStatus.CHECKED_IN);

        for (Room rm : allRooms) {
            boolean overlap = bookingRepository.existsOverlappingBookingForUpdate(
                    booking.getId(),
                    rm.getId(),
                    activeStatuses,
                    booking.getCheckInDate(),
                    newCheckOutDate
            );
            if (overlap) {
                throw new BookingOverlapException("Room " + rm.getRoomNumber() + " cannot be extended due to a future booking.");
            }
        }

        long newNights = Math.max(1, ChronoUnit.DAYS.between(booking.getCheckInDate(), newCheckOutDate));

        BigDecimal newRoomCharges = BigDecimal.ZERO;
        for (Room rm : allRooms) {
            newRoomCharges = newRoomCharges.add(rm.getPricePerNight().multiply(BigDecimal.valueOf(newNights)));
        }

        BigDecimal extra = booking.getExtraServicesTotal() != null ? booking.getExtraServicesTotal() : BigDecimal.ZERO;
        BigDecimal newSubtotal = newRoomCharges.add(extra);
        BigDecimal newGst = newRoomCharges.multiply(GST_RATE).setScale(0, RoundingMode.HALF_UP);
        BigDecimal newGross = newSubtotal.add(newGst);

        BigDecimal discount = booking.getDiscountAmount() != null ? booking.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal newTotal = newGross.subtract(discount).max(BigDecimal.ZERO);
        BigDecimal paid = booking.getAdvancePayment() != null ? booking.getAdvancePayment() : BigDecimal.ZERO;

        booking.setCheckOutDate(newCheckOutDate);
        booking.setRoomCharges(newRoomCharges);
        booking.setSubtotal(newSubtotal);
        booking.setTaxableAmount(newSubtotal);
        booking.setTaxAmount(newGst);
        booking.setTotalAmount(newTotal);
        booking.setBalanceDue(newTotal.subtract(paid).max(BigDecimal.ZERO));

        return enrichWithLedger(bookingRepository.saveAndFlush(booking));
    }


    @Override
    @Transactional
    public BookingResponse switchRoom(Long bookingId, Long targetRoomId, String reason) {
        return switchRoom(bookingId, targetRoomId, reason, null);
    }

    @Override
    @Transactional
    public BookingResponse switchRoom(Long bookingId, Long targetRoomId, String reason, Long sourceRoomId) {
        log.info("Switching room for bookingId: {}, targetRoomId: {}, sourceRoomId: {}", bookingId, targetRoomId, sourceRoomId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        Room targetRoom = roomRepository.findById(targetRoomId)
                .orElseThrow(() -> new RuntimeException("Target room not found with id: " + targetRoomId));

        if (targetRoom.getRoomStatus() != RoomStatus.AVAILABLE) {
            throw new RuntimeException("Target room " + targetRoom.getRoomNumber() + " is not available for transfer.");
        }

        List<Room> currentRooms = booking.getRooms();
        if (currentRooms == null) {
            currentRooms = new ArrayList<>();
            booking.setRooms(currentRooms);
        }

        Room roomToReplace = null;

        if (sourceRoomId != null) {
            // Find room matching by ID or by RoomNumber
            roomToReplace = currentRooms.stream()
                    .filter(r -> Objects.equals(r.getId(), sourceRoomId) ||
                            (r.getRoomNumber() != null && String.valueOf(r.getRoomNumber()).equals(String.valueOf(sourceRoomId))))
                    .findFirst()
                    .orElse(null);

            if (roomToReplace == null && booking.getRoom() != null) {
                if (Objects.equals(booking.getRoom().getId(), sourceRoomId) ||
                        (booking.getRoom().getRoomNumber() != null && String.valueOf(booking.getRoom().getRoomNumber()).equals(String.valueOf(sourceRoomId)))) {
                    roomToReplace = booking.getRoom();
                }
            }
        }

        if (roomToReplace == null) {
            if (!currentRooms.isEmpty()) {
                roomToReplace = currentRooms.get(0);
            } else {
                roomToReplace = booking.getRoom();
            }
        }

        if (roomToReplace == null) {
            throw new RuntimeException("No allocated room found to switch.");
        }

        final Long replacedRoomId = roomToReplace.getId();
        log.info("Replaced room resolved: Room #{} (ID: {})", roomToReplace.getRoomNumber(), replacedRoomId);

        roomToReplace.setRoomStatus(RoomStatus.CLEANING);
        roomRepository.save(roomToReplace);

        targetRoom.setRoomStatus(RoomStatus.OCCUPIED);
        roomRepository.save(targetRoom);

        currentRooms.removeIf(r -> Objects.equals(r.getId(), replacedRoomId));
        currentRooms.add(targetRoom);

        if (booking.getRoom() != null && Objects.equals(booking.getRoom().getId(), replacedRoomId)) {
            booking.setRoom(targetRoom);
        } else if (booking.getRoom() == null && !currentRooms.isEmpty()) {
            booking.setRoom(currentRooms.get(0));
        }

        booking.setPreviousRoomNumber(roomToReplace.getRoomNumber());

        Booking savedBooking = bookingRepository.saveAndFlush(booking);
        return enrichWithLedger(savedBooking);
    }

    @Override
    public List<BookingResponse> getBookingsByGuestId(Long guestId) {
        return bookingRepository.findByGuestIdOrderByCreatedAtDesc(guestId).stream().map(this::enrichWithLedger).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingDiscountResponse> getBookingDiscounts(Long bookingId) {
        return bookingDiscountRepository.findByBookingIdOrderByCreatedAtAsc(bookingId).stream()
                .map(bookingMapper::toDiscountResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateCheckInSlipPdf(Long bookingId, String preparedBy, String userEmail) {
        return masterReceiptPdfService.generateCheckInReceipt(getBookingEntity(bookingId), resolveStaffName(preparedBy, userEmail));
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateServiceSlipPdf(Long bookingId, String preparedBy, String userEmail) {
        return masterReceiptPdfService.generateExtraServiceReceipt(getBookingEntity(bookingId), null, resolveStaffName(preparedBy, userEmail));
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateMasterFolioPdf(Long bookingId, String preparedBy, String userEmail) {
        return masterReceiptPdfService.generateMasterFolioPdf(getBookingEntity(bookingId), resolveStaffName(preparedBy, userEmail));
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generatePaymentSlipPdf(Long bookingId, Long paymentId, String preparedBy, String userEmail) {
        return masterReceiptPdfService.generateExtraServiceReceipt(getBookingEntity(bookingId), paymentId, resolveStaffName(preparedBy, userEmail));
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateReceiptByNumberPdf(String receiptNumber, String preparedBy, String userEmail) {
        return masterReceiptPdfService.generateReceiptByReceiptNumber(receiptNumber, resolveStaffName(preparedBy, userEmail));
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateCancellationSlipPdf(Long bookingId, String preparedBy, String userEmail) {
        Booking booking = getBookingEntity(bookingId);
        List<Payment> payments = paymentRepository.findByBookingId(bookingId);
        Payment refund = payments.isEmpty() ? new Payment() : payments.get(0);
        return masterReceiptPdfService.generateRefundReceipt(booking, refund, resolveStaffName(preparedBy, userEmail));
    }

    private BookingResponse enrichWithLedger(Booking booking) {
        if (booking == null) return null;
        List<BookingDiscount> discounts = bookingDiscountRepository.findByBookingId(booking.getId());
        return bookingMapper.toResponse(booking, discounts);
    }

    private Booking getBookingEntity(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
    }

    private String resolveStaffName(String preparedBy, String userEmail) {
        if (preparedBy != null && !preparedBy.trim().isEmpty() && !preparedBy.contains("@")) {
            return preparedBy.trim();
        }
        if (userEmail != null && !userEmail.isBlank()) {
            return userRepo.findByEmail(userEmail)
                    .map(u -> (u.getFirstName() + " " + (u.getLastName() != null ? u.getLastName() : "")).trim())
                    .orElse("Staff");
        }
        return "Staff";
    }
}