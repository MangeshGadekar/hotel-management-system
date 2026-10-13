package com.athenura.hotel_management_system.booking.service.impl;

import com.athenura.hotel_management_system.booking.dto.BookingRequest;
import com.athenura.hotel_management_system.booking.dto.BookingResponse;
import com.athenura.hotel_management_system.booking.entity.Booking;
import com.athenura.hotel_management_system.booking.enums.BookingStatus;
import com.athenura.hotel_management_system.booking.mapper.BookingMapper;
import com.athenura.hotel_management_system.booking.repository.BookingRepository;
import com.athenura.hotel_management_system.booking.service.BookingService;
import com.athenura.hotel_management_system.common.exception.BookingOverlapException;
import com.athenura.hotel_management_system.coupon.service.CouponService;
import com.athenura.hotel_management_system.extraservice.entity.ExtraService;
import com.athenura.hotel_management_system.extraservice.enums.ServicePriceType;
import com.athenura.hotel_management_system.extraservice.repository.ExtraServiceRepository;
import com.athenura.hotel_management_system.guest.entity.Guest;
import com.athenura.hotel_management_system.guest.repository.GuestRepository;
import com.athenura.hotel_management_system.payment.dto.PaymentDTO;
import com.athenura.hotel_management_system.payment.service.PaymentService;
import com.athenura.hotel_management_system.room.entity.Room;
import com.athenura.hotel_management_system.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.athenura.hotel_management_system.booking.dto.CustomServiceRequest;
import java.math.RoundingMode;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final GuestRepository guestRepository;
    private final RoomRepository roomRepository;
    private final BookingMapper bookingMapper;
    private final PaymentService paymentService;
    private final ExtraServiceRepository extraServiceRepository;
    private final CouponService couponService;

    private static final BigDecimal GST_RATE = new BigDecimal("0.18");

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request) {

        // 1. Find Guest
//        Guest guest = guestRepository.findById(request.getGuestId())
//                .orElseThrow(() -> new RuntimeException("Guest not found"));


        // 1. Validate dates
        if (!request.getCheckOutDate().isAfter(request.getCheckInDate())) {
            throw new RuntimeException(
                    "Check-out date must be after check-in date"
            );
        }

        // 2. Find Room
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (room.getRoomStatus() == com.athenura.hotel_management_system.room.enums.RoomStatus.MAINTENANCE) {
            throw new RuntimeException("Room " + room.getRoomNumber() + " is currently under MAINTENANCE and cannot be booked.");
        }
        //3. Check room availability
        List<BookingStatus> activeStatuses = List.of(BookingStatus.BOOKED, BookingStatus.CHECKED_IN);

        boolean roomAlreadyBooked =
                bookingRepository.existsOverlappingBooking(
                        request.getRoomId(),
                        activeStatuses,
                        request.getCheckInDate(),
                        request.getCheckOutDate()
                );

        if (roomAlreadyBooked) {
            throw new BookingOverlapException(
                    "Room " + room.getRoomNumber() + " is already booked or occupied for the selected dates"
            );
        }





        // 4. Create Guest
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
            throw new RuntimeException("Guest email or guestId must be provided");
        }

        // 5. Calculate number of nights
        long nights = ChronoUnit.DAYS.between(
                request.getCheckInDate(),
                request.getCheckOutDate()
        );


        // 6. base room charges
        BigDecimal roomCharges = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));


        // 6.1 Calculate selected amenities amount
        List<ExtraService> selectedServices = new ArrayList<>();
        BigDecimal extraServicesTotal = BigDecimal.ZERO;

        if (request.getExtraServiceIds() != null && !request.getExtraServiceIds().isEmpty()) {
            selectedServices = extraServiceRepository.findAllById(request.getExtraServiceIds());
            for (ExtraService service : selectedServices) {
                if (service.getPrice() != null && Boolean.TRUE.equals(service.getActive())) {
                    BigDecimal itemCost = (service.getPriceType() == ServicePriceType.PER_NIGHT)
                            ? service.getPrice().multiply(BigDecimal.valueOf(nights))
                            : service.getPrice();
                    extraServicesTotal = extraServicesTotal.add(itemCost);
                }
            }
        }

        // 8. Subtotal
        BigDecimal subtotal = roomCharges.add(extraServicesTotal);

        // 9. Coupon & Discount Deduction
        BigDecimal discountAmount = BigDecimal.ZERO;
        String couponCode = null;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            couponCode = request.getCouponCode().trim().toUpperCase();
            discountAmount = couponService.calculateDiscount(couponCode, subtotal, room.getRoomType());
            couponService.incrementUsage(couponCode);
        }

        // 10. Taxable Amount & GST
        BigDecimal taxableAmount = subtotal.subtract(discountAmount).max(BigDecimal.ZERO).setScale(0, RoundingMode.HALF_UP);

        BigDecimal discountRatio = BigDecimal.ONE;
        if (subtotal.compareTo(BigDecimal.ZERO) > 0 && discountAmount.compareTo(BigDecimal.ZERO) > 0) {
            discountRatio = BigDecimal.ONE.subtract(discountAmount.divide(subtotal, 6, RoundingMode.HALF_UP));
        }

// 10.1 Net room charge taxed at standard 18% GST
        BigDecimal netRoomTaxable = roomCharges.multiply(discountRatio);
        BigDecimal totalCalculatedTax = netRoomTaxable.multiply(GST_RATE);

// 10.2 Net extra services taxed at each service's configured tax rate (5%, 12%, 18%, etc.)
        for (ExtraService service : selectedServices) {
            if (service.getPrice() != null && Boolean.TRUE.equals(service.getActive())) {
                BigDecimal itemCost = (service.getPriceType() == ServicePriceType.PER_NIGHT)
                        ? service.getPrice().multiply(BigDecimal.valueOf(nights))
                        : service.getPrice();

                BigDecimal netServiceTaxable = itemCost.multiply(discountRatio);
                BigDecimal serviceTaxRate = (service.getTaxRate() != null ? service.getTaxRate() : new BigDecimal("18.00"))
                        .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

                totalCalculatedTax = totalCalculatedTax.add(netServiceTaxable.multiply(serviceTaxRate));
            }
        }

        BigDecimal taxAmount = totalCalculatedTax.setScale(0, RoundingMode.HALF_UP);
        BigDecimal totalAmount = taxableAmount.add(taxAmount).setScale(0, RoundingMode.HALF_UP);

        // 11. Initial payment calculation
        BigDecimal advancePayment = BigDecimal.ZERO;
        if (request.getAmount() != null && request.getAmount().compareTo(BigDecimal.ZERO) > 0) {
            advancePayment = request.getAmount();
        } else if ("SPLIT_ADVANCE".equalsIgnoreCase(request.getPaymentType())) {
            advancePayment = totalAmount.multiply(new BigDecimal("0.40")).setScale(0, RoundingMode.HALF_UP);
        } else if ("FULL".equalsIgnoreCase(request.getPaymentType())) {
            advancePayment = totalAmount.setScale(0, RoundingMode.HALF_UP);
        }

        BigDecimal balanceDue = totalAmount.subtract(advancePayment).max(BigDecimal.ZERO);



        // 12. Build and save Booking
        Booking booking = Booking.builder()
                .bookingReference("BOOKING-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .guest(guest)
                .room(room)
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .roomCharges(roomCharges)
                .extraServicesTotal(extraServicesTotal)
                .subtotal(subtotal)
                .couponCode(couponCode)
                .discountAmount(discountAmount)
                .taxableAmount(taxableAmount)
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .advancePayment(advancePayment)
                .balanceDue(balanceDue)
                .bookingStatus(BookingStatus.BOOKED)
                .selectedExtraServices(selectedServices)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // 13. Record payment transaction if payment occurred
        if (advancePayment.compareTo(BigDecimal.ZERO) > 0 && request.getPaymentMethod() != null) {
            paymentService.processPayment(
                    PaymentDTO.PaymentRequest.builder()
                            .bookingId(savedBooking.getId())
                            .paymentType(request.getPaymentType() != null ? request.getPaymentType() : "SPLIT_ADVANCE")
                            .paymentMethod(request.getPaymentMethod())
                            .transactionReference("CARD_MACHINE".equalsIgnoreCase(request.getPaymentMethod())
                                    ? request.getTransactionReference()
                                    : null)
                            .amount(advancePayment)
                            .build()
            );
        }

        // 14. Convert to response
        return bookingMapper.toResponse(savedBooking);
    }

    @Override
    public BookingResponse updateBooking(Long id, BookingRequest request) {

        // 1. Find existing booking
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // 2. Update check-in date
        if (request.getCheckInDate() != null) {
            booking.setCheckInDate(request.getCheckInDate());
        }

        // 3. Update check-out date
        if (request.getCheckOutDate() != null) {
            booking.setCheckOutDate(request.getCheckOutDate());
        }

        // 4. Validate dates
        if (!booking.getCheckOutDate().isAfter(booking.getCheckInDate())) {
            throw new RuntimeException(
                    "Check-out date must be after check-in date"
            );
        }

        // 5. Check room availability
        List<BookingStatus> activeStatuses = List.of(BookingStatus.BOOKED, BookingStatus.CHECKED_IN);

        boolean roomAlreadyBooked =
                bookingRepository.existsOverlappingBookingForUpdate(
                        booking.getId(),
                        booking.getRoom().getId(),
                        activeStatuses,
                        booking.getCheckInDate(),
                        booking.getCheckOutDate()
                );

        if (roomAlreadyBooked) {
            throw new BookingOverlapException(
                    "Room is already booked or occupied for the selected dates"
            );
        }

        // 6. Calculate number of nights
        long nights = ChronoUnit.DAYS.between(
                booking.getCheckInDate(),
                booking.getCheckOutDate()
        );

        // 7. Calculate amount
        BigDecimal roomCharges = booking.getRoom().getPricePerNight().multiply(BigDecimal.valueOf(nights));
        booking.setRoomCharges(roomCharges);

        BigDecimal subtotal = roomCharges.add(booking.getExtraServicesTotal() != null ? booking.getExtraServicesTotal() : BigDecimal.ZERO);
        booking.setSubtotal(subtotal);

        BigDecimal discount = booking.getDiscountAmount() != null ? booking.getDiscountAmount() : BigDecimal.ZERO;
        // 8. Taxable & Itemized Dynamic Tax Calculation
        BigDecimal taxable = subtotal.subtract(discount).max(BigDecimal.ZERO);

        BigDecimal discountRatio = BigDecimal.ONE;
        if (subtotal.compareTo(BigDecimal.ZERO) > 0 && discount.compareTo(BigDecimal.ZERO) > 0) {
            discountRatio = BigDecimal.ONE.subtract(discount.divide(subtotal, 6, RoundingMode.HALF_UP));
        }

        BigDecimal netRoomTaxable = roomCharges.multiply(discountRatio);
        BigDecimal totalCalculatedTax = netRoomTaxable.multiply(GST_RATE);

        if (booking.getSelectedExtraServices() != null) {
            for (ExtraService service : booking.getSelectedExtraServices()) {
                if (service.getPrice() != null && Boolean.TRUE.equals(service.getActive())) {
                    BigDecimal itemCost = (service.getPriceType() == ServicePriceType.PER_NIGHT)
                            ? service.getPrice().multiply(BigDecimal.valueOf(nights))
                            : service.getPrice();

                    BigDecimal netServiceTaxable = itemCost.multiply(discountRatio);
                    BigDecimal serviceTaxRate = (service.getTaxRate() != null ? service.getTaxRate() : new BigDecimal("18.00"))
                            .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

                    totalCalculatedTax = totalCalculatedTax.add(netServiceTaxable.multiply(serviceTaxRate));
                }
            }
        }

        BigDecimal tax = totalCalculatedTax.setScale(0, RoundingMode.HALF_UP);
        BigDecimal total = taxable.add(tax).setScale(0, RoundingMode.HALF_UP);

        booking.setTaxableAmount(taxable.setScale(0, RoundingMode.HALF_UP));
        booking.setTaxAmount(tax);
        booking.setTotalAmount(total);
        booking.setBalanceDue(total.subtract(booking.getAdvancePayment() != null ? booking.getAdvancePayment() : BigDecimal.ZERO).max(BigDecimal.ZERO));
        Booking updatedBooking = bookingRepository.save(booking);

        // 9. Convert to response
        return bookingMapper.toResponse(updatedBooking);
    }

    @Override
    public BookingResponse getBookingById(Long id) {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        return bookingMapper.toResponse(booking);
    }

    @Override
    public List<BookingResponse> getAllBookings() {

        return bookingRepository.findAll()
                .stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Override
    public String cancelBooking(Long id) {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setBookingStatus(BookingStatus.CANCELLED);

        bookingRepository.save(booking);

        return "Booking with id " + id + " cancelled successfully.";
    }

    @Override
    @Transactional
    public BookingResponse checkInGuest(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));

        if (booking.getBookingStatus() != BookingStatus.BOOKED) {
            throw new RuntimeException("Only reservations with status BOOKED can be checked in. Current status: " + booking.getBookingStatus());
        }

        Room room = booking.getRoom();
        if (room != null) {
            if (room.getRoomStatus() == com.athenura.hotel_management_system.room.enums.RoomStatus.OCCUPIED) {
                throw new RuntimeException("Cannot check in: Previous guest has not checked out yet. Room " + room.getRoomNumber() + " is currently OCCUPIED.");
            }
            room.setRoomStatus(com.athenura.hotel_management_system.room.enums.RoomStatus.OCCUPIED);
            roomRepository.save(room);
        }

        booking.setBookingStatus(BookingStatus.CHECKED_IN);
        Booking savedBooking = bookingRepository.save(booking);
        return bookingMapper.toResponse(savedBooking);
    }

    @Override
    @Transactional
    public BookingResponse checkOutGuest(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));

        if (booking.getBookingStatus() != BookingStatus.CHECKED_IN) {
            throw new RuntimeException("Only checked-in reservations can be checked out. Current status: " + booking.getBookingStatus());
        }

        if (booking.getBalanceDue() != null && booking.getBalanceDue().compareTo(BigDecimal.ZERO) > 0) {
            throw new RuntimeException("Cannot check out. Pending balance due: ₹" + booking.getBalanceDue());
        }

        booking.setBookingStatus(BookingStatus.CHECKED_OUT);
        if (booking.getRoom() != null) {
            booking.getRoom().setRoomStatus(com.athenura.hotel_management_system.room.enums.RoomStatus.AVAILABLE);
            roomRepository.save(booking.getRoom());
        }

        Booking savedBooking = bookingRepository.save(booking);
        return bookingMapper.toResponse(savedBooking);
    }

    @Override
    @Transactional
    public BookingResponse addExtraServicesToBooking(Long bookingId, List<Long> extraServiceIds) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Cannot add services to a cancelled booking.");
        }

        if (extraServiceIds == null || extraServiceIds.isEmpty()) {
            return bookingMapper.toResponse(booking);
        }

        long nights = ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
        if (nights <= 0) nights = 1;

        List<ExtraService> catalogList = extraServiceRepository.findAllById(extraServiceIds);
        Map<Long, ExtraService> serviceMap = catalogList.stream()
                .collect(Collectors.toMap(ExtraService::getId, Function.identity()));

        BigDecimal addedCharges = BigDecimal.ZERO;
        BigDecimal addedTax = BigDecimal.ZERO;
        List<ExtraService> toAppend = new ArrayList<>();

        for (Long id : extraServiceIds) {
            ExtraService s = serviceMap.get(id);
            if (s != null && Boolean.TRUE.equals(s.getActive()) && s.getPrice() != null) {
                BigDecimal itemCost = (s.getPriceType() == ServicePriceType.PER_NIGHT)
                        ? s.getPrice().multiply(BigDecimal.valueOf(nights))
                        : s.getPrice();

                BigDecimal taxRate = (s.getTaxRate() != null ? s.getTaxRate() : new BigDecimal("18.00"))
                        .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

                addedCharges = addedCharges.add(itemCost);
                addedTax = addedTax.add(itemCost.multiply(taxRate));
                toAppend.add(s);
            }
        }

        BigDecimal addedTaxRounded = addedTax.setScale(0, RoundingMode.HALF_UP);
        BigDecimal addedTotal = addedCharges.add(addedTaxRounded);

        if (booking.getSelectedExtraServices() == null) {
            booking.setSelectedExtraServices(new ArrayList<>());
        } else {
            booking.setSelectedExtraServices(new ArrayList<>(booking.getSelectedExtraServices()));
        }
        booking.getSelectedExtraServices().addAll(toAppend);

        booking.setExtraServicesTotal(
                (booking.getExtraServicesTotal() != null ? booking.getExtraServicesTotal() : BigDecimal.ZERO).add(addedCharges)
        );
        booking.setSubtotal(
                (booking.getSubtotal() != null ? booking.getSubtotal() : BigDecimal.ZERO).add(addedCharges)
        );
        booking.setTaxableAmount(
                (booking.getTaxableAmount() != null ? booking.getTaxableAmount() : BigDecimal.ZERO).add(addedCharges)
        );
        booking.setTaxAmount(
                (booking.getTaxAmount() != null ? booking.getTaxAmount() : BigDecimal.ZERO).add(addedTaxRounded)
        );
        booking.setTotalAmount(
                (booking.getTotalAmount() != null ? booking.getTotalAmount() : BigDecimal.ZERO).add(addedTotal)
        );
        booking.setBalanceDue(
                (booking.getBalanceDue() != null ? booking.getBalanceDue() : BigDecimal.ZERO).add(addedTotal)
        );

        Booking savedBooking = bookingRepository.save(booking);
        return bookingMapper.toResponse(savedBooking);
    }

    @Override
    @Transactional
    public BookingResponse addCustomServiceToBooking(Long bookingId, CustomServiceRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Cannot add services to a cancelled booking.");
        }

        if (request.getPrice() == null || request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Service price must be greater than 0");
        }

        String serviceName = (request.getServiceName() != null && !request.getServiceName().trim().isEmpty())
                ? request.getServiceName().trim()
                : "Custom Extra Service";

        BigDecimal price = request.getPrice();
        BigDecimal taxRatePercent = (request.getTaxRate() != null && request.getTaxRate().compareTo(BigDecimal.ZERO) >= 0)
                ? request.getTaxRate()
                : new BigDecimal("18.00");

        BigDecimal taxRateFraction = taxRatePercent.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal addedTax = price.multiply(taxRateFraction).setScale(0, RoundingMode.HALF_UP);
        BigDecimal addedTotal = price.add(addedTax);

        // 1. Save as a non-catalog entity (active = false so it never shows in general amenities)
        ExtraService customService = ExtraService.builder()
                .name(serviceName)
                .description("Custom Service")
                .price(price)
                .priceType(ServicePriceType.PER_STAY)
                .taxRate(taxRatePercent)
                .category("Room Add-on")
                .bookingId(booking.getId())
                .active(false)
                .build();

        ExtraService savedService = extraServiceRepository.save(customService);

        // 2. Persist relationship inside the booking join table
        if (booking.getSelectedExtraServices() == null) {
            booking.setSelectedExtraServices(new ArrayList<>());
        }
        booking.getSelectedExtraServices().add(savedService);

        // 3. Update financial totals
        booking.setExtraServicesTotal(
                (booking.getExtraServicesTotal() != null ? booking.getExtraServicesTotal() : BigDecimal.ZERO).add(price)
        );
        booking.setSubtotal(
                (booking.getSubtotal() != null ? booking.getSubtotal() : BigDecimal.ZERO).add(price)
        );
        booking.setTaxableAmount(
                (booking.getTaxableAmount() != null ? booking.getTaxableAmount() : BigDecimal.ZERO).add(price)
        );
        booking.setTaxAmount(
                (booking.getTaxAmount() != null ? booking.getTaxAmount() : BigDecimal.ZERO).add(addedTax)
        );
        booking.setTotalAmount(
                (booking.getTotalAmount() != null ? booking.getTotalAmount() : BigDecimal.ZERO).add(addedTotal)
        );
        booking.setBalanceDue(
                (booking.getBalanceDue() != null ? booking.getBalanceDue() : BigDecimal.ZERO).add(addedTotal)
        );

        Booking savedBooking = bookingRepository.save(booking);
        return bookingMapper.toResponse(savedBooking);
    }

    @Override
    @Transactional
    public BookingResponse removeExtraServiceFromBooking(Long bookingId, Long extraServiceId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));

        if (booking.getBookingStatus() == BookingStatus.CHECKED_OUT || booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Cannot modify services on a finished or cancelled booking.");
        }

        List<ExtraService> services = booking.getSelectedExtraServices();
        if (services == null || services.isEmpty()) {
            throw new RuntimeException("No extra services attached to this booking.");
        }

        int targetIndex = -1;
        for (int i = 0; i < services.size(); i++) {
            if (services.get(i).getId().equals(extraServiceId)) {
                targetIndex = i;
                break;
            }
        }

        if (targetIndex == -1) {
            throw new RuntimeException("Service not found in this reservation.");
        }

        ExtraService serviceToRemove = services.get(targetIndex);

        long nights = ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
        if (nights <= 0) nights = 1;

        BigDecimal itemPrice = (serviceToRemove.getPriceType() == ServicePriceType.PER_NIGHT)
                ? serviceToRemove.getPrice().multiply(BigDecimal.valueOf(nights))
                : serviceToRemove.getPrice();

        BigDecimal taxRate = (serviceToRemove.getTaxRate() != null ? serviceToRemove.getTaxRate() : new BigDecimal("18.00"))
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal itemTax = itemPrice.multiply(taxRate).setScale(0, RoundingMode.HALF_UP);
        BigDecimal itemTotal = itemPrice.add(itemTax);

        BigDecimal totalPaid = (booking.getTotalAmount() != null ? booking.getTotalAmount() : BigDecimal.ZERO)
                .subtract(booking.getBalanceDue() != null ? booking.getBalanceDue() : BigDecimal.ZERO);

        BigDecimal newTotal = (booking.getTotalAmount() != null ? booking.getTotalAmount() : BigDecimal.ZERO).subtract(itemTotal);

        if (newTotal.compareTo(totalPaid) < 0) {
            throw new RuntimeException("This service cannot be removed because it has already been paid for.");
        }

        services.remove(targetIndex);
        booking.setExtraServicesTotal(booking.getExtraServicesTotal().subtract(itemPrice));
        booking.setSubtotal(booking.getSubtotal().subtract(itemPrice));
        booking.setTaxableAmount(booking.getTaxableAmount().subtract(itemPrice));
        booking.setTaxAmount(booking.getTaxAmount().subtract(itemTax));
        booking.setTotalAmount(newTotal);
        booking.setBalanceDue(booking.getBalanceDue().subtract(itemTotal));

        Booking saved = bookingRepository.save(booking);
        return bookingMapper.toResponse(saved);
    }

}