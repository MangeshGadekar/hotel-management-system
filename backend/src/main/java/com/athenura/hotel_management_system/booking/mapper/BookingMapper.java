package com.athenura.hotel_management_system.booking.mapper;

import com.athenura.hotel_management_system.booking.dto.BookingRequest;
import com.athenura.hotel_management_system.booking.dto.BookingResponse;
import com.athenura.hotel_management_system.booking.entity.Booking;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {

    public BookingResponse toResponse(Booking booking) {

        return BookingResponse.builder()
                .id(booking.getId())

                // Guest
                .guestId(booking.getGuest().getId())
                .guestName(
                        booking.getGuest().getFirstName()
                                + " "
                                + booking.getGuest().getLastName()
                )

                // Room
                .roomId(booking.getRoom().getId())
                .roomNumber(booking.getRoom().getRoomNumber())
                .roomType(booking.getRoom().getRoomType().name())

                // Receptionist
                .receptionistId(
                        booking.getReceptionist() != null
                                ? booking.getReceptionist().getId()
                                : null
                )
                .receptionistName(
                        booking.getReceptionist() != null
                                ? booking.getReceptionist().getFirstName()
                                + " "
                                + booking.getReceptionist().getLastName()
                                : null
                )

                // Booking
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .totalAmount(booking.getTotalAmount())
                .bookingStatus(booking.getBookingStatus())

                .build();
    }
}