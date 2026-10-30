package com.athenura.hotel_management_system.booking.mapper;

import com.athenura.hotel_management_system.booking.dto.BookingDiscountResponse;
import com.athenura.hotel_management_system.booking.dto.BookingResponse;
import com.athenura.hotel_management_system.booking.entity.Booking;
import com.athenura.hotel_management_system.booking.entity.BookingDiscount;
import com.athenura.hotel_management_system.extraservice.mapper.ExtraServiceMapper;
import com.athenura.hotel_management_system.room.dto.RoomResponse;
import com.athenura.hotel_management_system.room.entity.Room;
import com.athenura.hotel_management_system.room.mapper.RoomMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class BookingMapper {

    private final ExtraServiceMapper extraServiceMapper;
    private final RoomMapper roomMapper;

    public BookingResponse toResponse(Booking booking) {
        return toResponse(booking, Collections.emptyList());
    }

    public BookingResponse toResponse(Booking booking, List<BookingDiscount> discounts) {
        if (booking == null) return null;

        BigDecimal coupon = BigDecimal.ZERO;
        BigDecimal concession = BigDecimal.ZERO;

        if (discounts != null) {
            for (BookingDiscount d : discounts) {
                BigDecimal val = d.getCalculatedAmount() != null ? d.getCalculatedAmount() : BigDecimal.ZERO;
                String source = String.valueOf(d.getDiscountSource());

                if ("COUPON".equalsIgnoreCase(source)) {
                    coupon = coupon.add(val);
                } else if ("DESK_CONCESSION".equalsIgnoreCase(source)) {
                    concession = concession.add(val);
                }
            }
        }

        if (concession.compareTo(BigDecimal.ZERO) == 0 && booking.getDiscountAmount() != null) {
            concession = booking.getDiscountAmount().subtract(coupon).max(BigDecimal.ZERO);
        }

        BigDecimal totalDisc = coupon.add(concession);
        BigDecimal roomTariff = booking.getRoomCharges() != null ? booking.getRoomCharges() : BigDecimal.ZERO;
        BigDecimal extraServices = booking.getExtraServicesTotal() != null ? booking.getExtraServicesTotal() : BigDecimal.ZERO;
        BigDecimal tax = booking.getTaxAmount() != null ? booking.getTaxAmount() : BigDecimal.ZERO;

        BigDecimal gross = roomTariff.add(extraServices).add(tax);
        BigDecimal net = booking.getTotalAmount() != null
                ? booking.getTotalAmount()
                : gross.subtract(totalDisc).max(BigDecimal.ZERO);

        BigDecimal advance = booking.getAdvancePayment() != null ? booking.getAdvancePayment() : BigDecimal.ZERO;
        BigDecimal balance = booking.getBalanceDue() != null ? booking.getBalanceDue() : BigDecimal.ZERO;

        List<Room> activeRooms = new ArrayList<>();
        if (booking.getRooms() != null && !booking.getRooms().isEmpty()) {
            activeRooms.addAll(booking.getRooms());
        } else if (booking.getRoom() != null) {
            activeRooms.add(booking.getRoom());
        }

        List<RoomResponse> roomResponses = activeRooms.stream()
                .map(roomMapper::toResponse)
                .toList();

        String allocatedRoomsStr = activeRooms.isEmpty()
                ? "—"
                : activeRooms.stream().map(r -> "Room " + r.getRoomNumber()).collect(Collectors.joining(", "));

        Room primaryRoom = !activeRooms.isEmpty() ? activeRooms.get(0) : booking.getRoom();

        long nights = (booking.getCheckInDate() != null && booking.getCheckOutDate() != null)
                ? Math.max(1, ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate()))
                : 1;

        return BookingResponse.builder()
                .id(booking.getId())
                .receiptNumber(booking.getReceiptNumber())
                .bookingReference(booking.getBookingReference())
                .guestId(booking.getGuest() != null ? booking.getGuest().getId() : null)
                .guestName(booking.getGuest() != null
                        ? ((booking.getGuest().getFirstName() != null ? booking.getGuest().getFirstName() : "")
                        + " "
                        + (booking.getGuest().getLastName() != null ? booking.getGuest().getLastName() : "")).trim()
                        : "Guest")
                .guestEmail(booking.getGuest() != null ? booking.getGuest().getEmail() : null)
                .guestPhone(booking.getGuest() != null ? booking.getGuest().getPhone() : null)
                .roomId(primaryRoom != null ? primaryRoom.getId() : null)
                .roomNumber(primaryRoom != null ? primaryRoom.getRoomNumber() : null)
                .roomType(primaryRoom != null && primaryRoom.getRoomType() != null ? primaryRoom.getRoomType().name() : null)
                .previousRoomNumber(booking.getPreviousRoomNumber())
                .rooms(roomResponses)
                .allocatedRoomsDisplay(allocatedRoomsStr)
                .totalGuests(booking.getTotalGuests() != null ? booking.getTotalGuests() : 1)
                .receptionistId(booking.getReceptionist() != null ? booking.getReceptionist().getId() : null)
                .receptionistName(booking.getReceptionist() != null
                        ? ((booking.getReceptionist().getFirstName() != null ? booking.getReceptionist().getFirstName() : "")
                        + " "
                        + (booking.getReceptionist().getLastName() != null ? booking.getReceptionist().getLastName() : "")).trim()
                        : null)
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .nights(nights)
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
                .bookingStatus(booking.getBookingStatus())

                .selectedExtraServices(booking.getSelectedExtraServices() != null
                        ? booking.getSelectedExtraServices().stream().map(extraServiceMapper::toResponse).toList()
                        : Collections.emptyList())

                .grossTotal(gross)
                .couponDiscount(coupon)
                .deskConcession(concession)
                .totalConcessions(totalDisc)
                .netPayable(net)
                .totalPaid(advance)
                .totalBalanceDue(balance)
                .build();
    }

    public BookingDiscountResponse toDiscountResponse(BookingDiscount discount) {
        if (discount == null) return null;
        return BookingDiscountResponse.builder()
                .id(discount.getId())
                .bookingId(discount.getBookingId())
                .receiptNumber(discount.getReceiptNumber())
                .discountSource(discount.getDiscountSource())
                .discountType(discount.getDiscountType())
                .discountValue(discount.getDiscountValue())
                .calculatedAmount(discount.getCalculatedAmount())
                .reason(discount.getReason())
                .createdAt(discount.getCreatedAt())
                .build();
    }
}