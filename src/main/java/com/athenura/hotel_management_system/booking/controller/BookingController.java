package com.athenura.hotel_management_system.booking.service.impl;

import com.athenura.hotel_management_system.booking.dto.BookingRequest;
import com.athenura.hotel_management_system.booking.dto.BookingResponse;
import com.athenura.hotel_management_system.booking.entity.Booking;
import com.athenura.hotel_management_system.booking.enums.BookingStatus;
import com.athenura.hotel_management_system.booking.mapper.BookingMapper;
import com.athenura.hotel_management_system.booking.repository.BookingRepository;
import com.athenura.hotel_management_system.booking.service.BookingService;
import com.athenura.hotel_management_system.common.exception.BookingOverlapException;
import com.athenura.hotel_management_system.common.repository.UserRepo;
import com.athenura.hotel_management_system.guest.entity.Guest;
import com.athenura.hotel_management_system.guest.repository.GuestRepository;
import com.athenura.hotel_management_system.room.entity.Room;
import com.athenura.hotel_management_system.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final GuestRepository guestRepository;
    private final RoomRepository roomRepository;
    private final UserRepo userRepo;
    private final BookingMapper bookingMapper;

    @Override
    public BookingResponse createBooking(BookingRequest request) {
        Guest guest = guestRepository.findById(request.getGuestId())
                .orElseThrow(() -> new RuntimeException("Guest not found"));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (!request.getCheckOutDate().isAfter(request.getCheckInDate())) {
            throw new RuntimeException("Check-out date must be after check-in date");
        }

        boolean roomAlreadyBooked = bookingRepository.existsOverlappingBooking(
                request.getRoomId(),
                BookingStatus.BOOKED,
                request.getCheckInDate(),
                request.getCheckOutDate()
        );

        if (roomAlreadyBooked) {
            throw new BookingOverlapException("Room is already booked for the selected dates");
        }

        long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal totalAmount = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        Booking booking = Booking.builder()
                .guest(guest)
                .room(room)
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .totalAmount(totalAmount)
                .bookingStatus(BookingStatus.BOOKED)
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        return bookingMapper.toResponse(savedBooking);
    }

    @Override
    public BookingResponse updateBooking(Long id, BookingRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (request.getCheckInDate() != null) {
            booking.setCheckInDate(request.getCheckInDate());
        }

        if (request.getCheckOutDate() != null) {
            booking.setCheckOutDate(request.getCheckOutDate());
        }

        if (!booking.getCheckOutDate().isAfter(booking.getCheckInDate())) {
            throw new RuntimeException("Check-out date must be after check-in date");
        }

        boolean roomAlreadyBooked = bookingRepository.existsOverlappingBookingForUpdate(
                booking.getId(),
                booking.getRoom().getId(),
                BookingStatus.BOOKED,
                booking.getCheckInDate(),
                booking.getCheckOutDate()
        );

        if (roomAlreadyBooked) {
            throw new BookingOverlapException("Room is already booked for the selected dates");
        }

        long nights = ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
        BigDecimal totalAmount = booking.getRoom().getPricePerNight().multiply(BigDecimal.valueOf(nights));
        booking.setTotalAmount(totalAmount);

        Booking updatedBooking = bookingRepository.save(booking);
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

    // New Implemented Method for Dynamic User Booking Fetching
    @Override
    public List<BookingResponse> getBookingsByUserEmail(String email) {
        List<Booking> bookings = bookingRepository.findByGuestEmail(email);
        return bookings.stream()
                .map(bookingMapper::toResponse)
                .toList();
    }
}