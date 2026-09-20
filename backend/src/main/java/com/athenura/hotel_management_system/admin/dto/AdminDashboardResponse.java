package com.athenura.hotel_management_system.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {

    // Revenue
    private BigDecimal totalRevenue;
    private BigDecimal todayRevenue;
    private BigDecimal monthlyRevenue;

    // Payment
    private BigDecimal totalPendingAmount;

    // Rooms
    private long totalRooms;
    private long availableRooms;
    private long occupiedRooms;
    private long reservedRooms;
    private long maintenanceRooms;

    // Bookings
    private long totalBookings;
    private long todayBookings;

    // Customers
    private long totalCustomers;
}