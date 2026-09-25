package com.athenura.hotel_management_system.booking.service.impl;

import com.athenura.hotel_management_system.amenity.entity.Amenity;
import com.athenura.hotel_management_system.amenity.enums.AmenityPriceType;
import com.athenura.hotel_management_system.amenity.repository.AmenityRepository;
import com.athenura.hotel_management_system.booking.dto.BookingRequest;
import com.athenura.hotel_management_system.booking.dto.BookingResponse;
import com.athenura.hotel_management_system.booking.entity.Booking;
import com.athenura.hotel_management_system.booking.enums.BookingStatus;
import com.athenura.hotel_management_system.booking.mapper.BookingMapper;
import com.athenura.hotel_management_system.booking.repository.BookingRepository;
import com.athenura.hotel_management_system.booking.service.BookingService;
import com.athenura.hotel_management_system.common.entity.Users;
import com.athenura.hotel_management_system.common.enums.Role;
import com.athenura.hotel_management_system.common.exception.BookingOverlapException;
import com.athenura.hotel_management_system.common.repository.UserRepo;
import com.athenura.hotel_management_system.guest.entity.Guest;
import com.athenura.hotel_management_system.guest.repository.GuestRepository;
import com.athenura.hotel_management_system.payment.dto.PaymentDTO;
import com.athenura.hotel_management_system.payment.service.PaymentService;
import com.athenura.hotel_management_system.room.entity.Room;
import com.athenura.hotel_management_system.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final GuestRepository guestRepository;
    private final RoomRepository roomRepository;
    private final UserRepo userRepo;
    private final BookingMapper bookingMapper;
    private final PaymentService paymentService;
    private final AmenityRepository amenityRepository;

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

        //3. Check room availability
        boolean roomAlreadyBooked =
                bookingRepository.existsOverlappingBooking(
                        request.getRoomId(),
                        BookingStatus.BOOKED,
                        request.getCheckInDate(),
                        request.getCheckOutDate()
                );

        if (roomAlreadyBooked) {
            throw new BookingOverlapException(
                    "Room is already booked for the selected dates"
            );
        }


        // 4. Create Guest
        Guest guest = Guest.builder()
                .firstName(request.getGuest().getFirstName())
                .lastName(request.getGuest().getLastName())
                .phone(request.getGuest().getPhone())
                .email(request.getGuest().getEmail())
                .idProofType(request.getGuest().getIdProofType())
                .idProofNumber(request.getGuest().getIdProofNumber())
                .address(request.getGuest().getAddress())
                .city(request.getGuest().getCity())
                .state(request.getGuest().getState())
                .postalCode(request.getGuest().getPostalCode())
                .build();

        Guest savedGuest = guestRepository.save(guest);

        // 5. Calculate number of nights
        long nights = ChronoUnit.DAYS.between(
                request.getCheckInDate(),
                request.getCheckOutDate()
        );

        // 6. Calculate base room amount
        BigDecimal totalAmount = room.getPricePerNight()
                .multiply(BigDecimal.valueOf(nights));

        // 6.1 Calculate selected amenities amount
        List<Amenity> selectedAmenities = new ArrayList<>();
        if (request.getAmenityIds() != null && !request.getAmenityIds().isEmpty()) {
            selectedAmenities = amenityRepository.findAllById(request.getAmenityIds());
            for (Amenity amenity : selectedAmenities) {
                if (amenity.getPrice() != null) {
                    if (amenity.getPriceType() == AmenityPriceType.PER_NIGHT) {
                        totalAmount = totalAmount.add(amenity.getPrice().multiply(BigDecimal.valueOf(nights)));
                    } else {
                        totalAmount = totalAmount.add(amenity.getPrice());
                    }
                }
            }
        }

        // 7. Create Booking
        Booking booking = Booking.builder()
                .guest(guest)
                .room(room)
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .totalAmount(totalAmount)
                .bookingStatus(BookingStatus.BOOKED)
                .selectedAmenities(selectedAmenities)
                .build();

        // 7. Save Booking
        Booking savedBooking = bookingRepository.save(booking);

        // 8. Convert to response
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
        boolean roomAlreadyBooked =
                bookingRepository.existsOverlappingBookingForUpdate(
                        booking.getId(),
                        booking.getRoom().getId(),
                        BookingStatus.BOOKED,
                        booking.getCheckInDate(),
                        booking.getCheckOutDate()
                );

        if (roomAlreadyBooked) {
            throw new BookingOverlapException(
                    "Room is already booked for the selected dates"
            );
        }

        // 6. Calculate number of nights
        long nights = ChronoUnit.DAYS.between(
                booking.getCheckInDate(),
                booking.getCheckOutDate()
        );

        // 7. Calculate total amount
        BigDecimal totalAmount = booking.getRoom()
                .getPricePerNight()
                .multiply(BigDecimal.valueOf(nights));

        booking.setTotalAmount(totalAmount);

        // 8. Save updated booking
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

}