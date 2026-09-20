package com.athenura.hotel_management_system.admin.service.impl;

import com.athenura.hotel_management_system.admin.dto.AdminDashboardResponse;
import com.athenura.hotel_management_system.admin.service.AdminDashboardService;
import com.athenura.hotel_management_system.booking.enums.BookingStatus;
import com.athenura.hotel_management_system.booking.repository.BookingRepository;
import com.athenura.hotel_management_system.guest.repository.GuestRepository;
import com.athenura.hotel_management_system.payment.repository.PaymentRepository;
import com.athenura.hotel_management_system.room.enums.RoomStatus;
import com.athenura.hotel_management_system.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final BookingRepository bookingRepository;
    private final GuestRepository guestRepository;
    private final PaymentRepository paymentRepository;
    private final RoomRepository roomRepository;

    @Override
    public AdminDashboardResponse getDashboard() {

        // DATE RANGE

        LocalDate today = LocalDate.now();

        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime startOfTomorrow = today.plusDays(1).atStartOfDay();

        YearMonth currentMonth = YearMonth.now();

        LocalDateTime startOfMonth =
                currentMonth.atDay(1).atStartOfDay();

        LocalDateTime startOfNextMonth =
                currentMonth.plusMonths(1).atDay(1).atStartOfDay();


        // REVENUE

        // Total successful payments
        BigDecimal totalRevenue =
                paymentRepository.getTotalRevenue();

        // Today's successful payments
        BigDecimal todayRevenue =
                paymentRepository.getRevenueBetween(
                        startOfToday,
                        startOfTomorrow
                );

        // Current month's successful payments
        BigDecimal monthlyRevenue =
                paymentRepository.getRevenueBetween(
                        startOfMonth,
                        startOfNextMonth
                );


        // PENDING PAYMENTS
        BigDecimal totalPendingAmount =
                bookingRepository.getTotalPendingAmount();


        // ROOMS
        long totalRooms =
                roomRepository.count();

        long availableRooms =
                roomRepository.countByRoomStatus(
                        RoomStatus.AVAILABLE
                );

        long occupiedRooms =
                roomRepository.countByRoomStatus(
                        RoomStatus.OCCUPIED
                );

        long reservedRooms =
                roomRepository.countByRoomStatus(
                        RoomStatus.RESERVED
                );

        long maintenanceRooms =
                roomRepository.countByRoomStatus(
                        RoomStatus.MAINTENANCE
                );


        // BOOKINGS

        long totalBookings =
                bookingRepository.count();

        long todayBookings =
                bookingRepository.countByCheckInDate(today);


        // CUSTOMERS

        long totalCustomers =
                guestRepository.count();



        return AdminDashboardResponse.builder()

                // Revenue
                .totalRevenue(totalRevenue)
                .todayRevenue(todayRevenue)
                .monthlyRevenue(monthlyRevenue)

                // Payment
                .totalPendingAmount(totalPendingAmount)

                // Rooms
                .totalRooms(totalRooms)
                .availableRooms(availableRooms)
                .occupiedRooms(occupiedRooms)
                .reservedRooms(reservedRooms)
                .maintenanceRooms(maintenanceRooms)

                // Bookings
                .totalBookings(totalBookings)
                .todayBookings(todayBookings)

                // Customers
                .totalCustomers(totalCustomers)

                .build();
    }
}