package com.athenura.hotel_management_system.admin.service;

import com.athenura.hotel_management_system.admin.dto.AdminDashboardResponse;

public interface AdminDashboardService {

    // get data (JSON) for admin dashboard
    AdminDashboardResponse getDashboard();
}