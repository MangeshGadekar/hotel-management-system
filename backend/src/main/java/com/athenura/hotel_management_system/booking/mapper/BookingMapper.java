package com.athenura.hotel_management_system.booking.mapper;

import com.athenura.hotel_management_system.booking.dto.BookingResponse;
import com.athenura.hotel_management_system.booking.entity.Booking;
import com.athenura.hotel_management_system.extraservice.mapper.ExtraServiceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
@RequiredArgsConstructor
public class BookingMapper {

    private final ExtraServiceMapper extraServiceMapper;

    public BookingResponse toResponse(Booking booking) {
        if (booking == null) {
            return null;
        }

        return BookingResponse.builder()
                .id(booking.getId())

                // Guest
                .guestId(booking.getGuest() != null ? booking.getGuest().getId() : null)
                .guestName(
                        booking.getGuest() != null
                                ? (booking.getGuest().getFirstName() + " " + booking.getGuest().getLastName()).trim()
                                : null
                )
                .guestEmail(booking.getGuest() != null ? booking.getGuest().getEmail() : null)
                .guestPhone(booking.getGuest() != null ? booking.getGuest().getPhone() : null)

                // Room
                .roomId(booking.getRoom() != null ? booking.getRoom().getId() : null)
                .roomNumber(booking.getRoom() != null ? booking.getRoom().getRoomNumber() : null)
                .roomType(booking.getRoom() != null && booking.getRoom().getRoomType() != null
                        ? booking.getRoom().getRoomType().name()
                        : null)

                // Receptionist
                .receptionistId(
                        booking.getReceptionist() != null
                                ? booking.getReceptionist().getId()
                                : null
                )
                .receptionistName(
                        booking.getReceptionist() != null
                                ? ((booking.getReceptionist().getFirstName() != null ? booking.getReceptionist().getFirstName() : "")
                                  + " "
                                  + (booking.getReceptionist().getLastName() != null ? booking.getReceptionist().getLastName() : "")).trim()
                                : null
                )

                // Booking
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())

                //billing and booking
                .roomCharges(booking.getRoomCharges())
                .extraServicesTotal(booking.getExtraServicesTotal())
                .subtotal(booking.getSubtotal())
                .couponCode(booking.getCouponCode())
                .discountAmount(booking.getDiscountAmount())
                .taxableAmount(booking.getTaxableAmount())
                .taxAmount(booking.getTaxAmount())
                .totalAmount(booking.getTotalAmount())
                .advancePayment(booking.getAdvancePayment())
                .balanceDue(booking.getBalanceDue())

                //booking status
                .bookingStatus(booking.getBookingStatus())

                // Extra Services
                .selectedExtraServices(
                        booking.getSelectedExtraServices() != null
                                ? booking.getSelectedExtraServices().stream().map(extraServiceMapper::toResponse).toList()
                                : Collections.emptyList()
                )

                .build();
    }
}