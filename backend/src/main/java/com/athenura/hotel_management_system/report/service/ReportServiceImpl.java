package com.athenura.hotel_management_system.report.service;

import com.athenura.hotel_management_system.booking.entity.Booking;
import com.athenura.hotel_management_system.booking.enums.BookingStatus;
import com.athenura.hotel_management_system.common.entity.Users;
import com.athenura.hotel_management_system.common.repository.UserRepo;
import com.athenura.hotel_management_system.report.dto.ReportResponse;
import com.athenura.hotel_management_system.report.dto.ReportResponse.*;
import com.athenura.hotel_management_system.report.repository.ReportBookingRepository;
import com.athenura.hotel_management_system.report.repository.ReportPaymentRepository;
import com.athenura.hotel_management_system.report.service.ReportPdfBuilder;
import com.athenura.hotel_management_system.report.service.ReportService;
import com.athenura.hotel_management_system.room.entity.Room;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private static final String ONLINE_LABEL = "Online / Guest";

    private final ReportBookingRepository reportBookingRepository;
    private final ReportPaymentRepository reportPaymentRepository;
    private final UserRepo userRepo;
    private final ReportPdfBuilder reportPdfBuilder;

    @Override
    @Transactional(readOnly = true)
    public ReportResponse getReport(LocalDate from, LocalDate to, Long receptionistId) {
        if (from == null || to == null) {
            throw new IllegalArgumentException("from and to dates are required");
        }
        if (to.isBefore(from)) {
            throw new IllegalArgumentException("'to' date cannot be before 'from' date");
        }

        var start = from.atStartOfDay();
        var end = to.plusDays(1).atStartOfDay();

        List<Booking> bookings = (receptionistId == null)
                ? reportBookingRepository.findAllInRange(start, end)
                : reportBookingRepository.findByReceptionistInRange(receptionistId, start, end);


        Map<Long, BigDecimal> paidMap = new HashMap<>();
        if (!bookings.isEmpty()) {
            List<Long> ids = bookings.stream().map(Booking::getId).toList();
            for (Object[] row : reportPaymentRepository.sumPaidGroupedByBooking(ids)) {
                paidMap.put((Long) row[0], (BigDecimal) row[1]);
            }
        }

        List<BookingRow> rows = new ArrayList<>();
        for (Booking b : bookings) {
            boolean cancelled = b.getBookingStatus() == BookingStatus.CANCELLED;
            BigDecimal total = nz(b.getTotalAmount());
            BigDecimal paid = paidMap.getOrDefault(b.getId(), BigDecimal.ZERO);
            BigDecimal balance = cancelled ? BigDecimal.ZERO : total.subtract(paid).max(BigDecimal.ZERO);

            rows.add(BookingRow.builder()
                    .bookingId(b.getId())
                    .bookingReference(b.getBookingReference())
                    .guestName(guestName(b))
                    .guestPhone(b.getGuest() != null ? b.getGuest().getPhone() : null)
                    .rooms(roomNumbers(b))
                    .checkInDate(b.getCheckInDate())
                    .checkOutDate(b.getCheckOutDate())
                    .status(b.getBookingStatus() != null ? b.getBookingStatus().name() : "")
                    .receptionistId(b.getReceptionist() != null ? b.getReceptionist().getId() : null)
                    .receptionistName(userName(b.getReceptionist()))
                    .totalAmount(total)
                    .totalPaid(paid)
                    .balanceDue(balance)
                    .bookedAt(b.getCreatedAt())
                    .build());
        }


        List<BookingRow> active = rows.stream().filter(r -> !"CANCELLED".equals(r.getStatus())).toList();
        Summary summary = Summary.builder()
                .totalBookings(rows.size())
                .cancelledBookings(rows.size() - active.size())
                .totalAmount(sum(active, BookingRow::getTotalAmount))
                .totalPaid(sum(rows, BookingRow::getTotalPaid))
                .totalBalance(sum(active, BookingRow::getBalanceDue))
                .build();


        Map<Long, List<BookingRow>> grouped = rows.stream().collect(
                Collectors.groupingBy(r -> r.getReceptionistId() == null ? -1L : r.getReceptionistId(),
                        LinkedHashMap::new, Collectors.toList()));
        List<ReceptionistRow> byReceptionist = new ArrayList<>();
        grouped.forEach((key, list) -> {
            List<BookingRow> act = list.stream().filter(r -> !"CANCELLED".equals(r.getStatus())).toList();
            byReceptionist.add(ReceptionistRow.builder()
                    .receptionistId(key == -1L ? null : key)
                    .receptionistName(key == -1L ? ONLINE_LABEL : list.get(0).getReceptionistName())
                    .bookings(list.size())
                    .cancelled(list.size() - act.size())
                    .totalAmount(sum(act, BookingRow::getTotalAmount))
                    .totalPaid(sum(list, BookingRow::getTotalPaid))
                    .totalBalance(sum(act, BookingRow::getBalanceDue))
                    .build());
        });
        byReceptionist.sort(Comparator.comparingLong(ReceptionistRow::getBookings).reversed());


        Map<LocalDate, List<BookingRow>> byDay = rows.stream()
                .filter(r -> r.getBookedAt() != null)
                .collect(Collectors.groupingBy(r -> r.getBookedAt().toLocalDate()));
        List<DailyRow> daily = new ArrayList<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            List<BookingRow> list = byDay.getOrDefault(d, List.of());
            List<BookingRow> act = list.stream().filter(r -> !"CANCELLED".equals(r.getStatus())).toList();
            daily.add(DailyRow.builder()
                    .date(d)
                    .bookings(list.size())
                    .totalAmount(sum(act, BookingRow::getTotalAmount))
                    .totalPaid(sum(list, BookingRow::getTotalPaid))
                    .build());
        }

        String recName = null;
        if (receptionistId != null) {
            recName = userRepo.findById(receptionistId).map(this::userName).orElse(null);
        }

        return ReportResponse.builder()
                .from(from).to(to)
                .receptionistId(receptionistId)
                .receptionistName(recName)
                .summary(summary)
                .byReceptionist(byReceptionist)
                .daily(daily)
                .bookings(rows)
                .build();
    }

    @Override
    public byte[] generatePdf(LocalDate from, LocalDate to, Long receptionistId) {
        return reportPdfBuilder.build(getReport(from, to, receptionistId));
    }

    @Override
    public byte[] generateCsv(LocalDate from, LocalDate to, Long receptionistId) {
        ReportResponse r = getReport(from, to, receptionistId);
        StringBuilder sb = new StringBuilder("\uFEFF"); // BOM so Excel reads UTF-8 properly
        sb.append("Booking Ref,Booked On,Guest,Phone,Rooms,Check-In,Check-Out,Status,Receptionist,Total,Paid,Balance\n");
        for (BookingRow b : r.getBookings()) {
            sb.append(csv(b.getBookingReference())).append(',')
                    .append(csv(b.getBookedAt() != null ? b.getBookedAt().toLocalDate().toString() : "")).append(',')
                    .append(csv(b.getGuestName())).append(',')
                    .append(csv(b.getGuestPhone())).append(',')
                    .append(csv(b.getRooms())).append(',')
                    .append(csv(String.valueOf(b.getCheckInDate()))).append(',')
                    .append(csv(String.valueOf(b.getCheckOutDate()))).append(',')
                    .append(csv(b.getStatus())).append(',')
                    .append(csv(b.getReceptionistId() == null ? ONLINE_LABEL : b.getReceptionistName())).append(',')
                    .append(b.getTotalAmount()).append(',')
                    .append(b.getTotalPaid()).append(',')
                    .append(b.getBalanceDue()).append('\n');
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }



    private static BigDecimal nz(BigDecimal v) { return v == null ? BigDecimal.ZERO : v; }

    private static BigDecimal sum(List<BookingRow> list, Function<BookingRow, BigDecimal> f) {
        return list.stream().map(f).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String userName(Users u) {
        if (u == null) return null;
        String n = ((u.getFirstName() != null ? u.getFirstName() : "") + " "
                + (u.getLastName() != null ? u.getLastName() : "")).trim();
        return n.isEmpty() ? u.getEmail() : n;
    }

    private String guestName(Booking b) {
        if (b.getGuest() == null) return "";
        return ((b.getGuest().getFirstName() != null ? b.getGuest().getFirstName() : "") + " "
                + (b.getGuest().getLastName() != null ? b.getGuest().getLastName() : "")).trim();
    }

    private String roomNumbers(Booking b) {
        if (b.getRooms() != null && !b.getRooms().isEmpty()) {
            return b.getRooms().stream().map(Room::getRoomNumber).collect(Collectors.joining(", "));
        }
        return b.getRoom() != null ? b.getRoom().getRoomNumber() : "";
    }

    private static String csv(String v) {
        if (v == null) return "";
        String s = v.replace("\"", "\"\"");
        return (s.contains(",") || s.contains("\"") || s.contains("\n")) ? "\"" + s + "\"" : s;
    }
}
