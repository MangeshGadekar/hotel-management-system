package com.athenura.hotel_management_system.report.service;

import com.athenura.hotel_management_system.report.dto.ReportResponse;

import java.time.LocalDate;

public interface ReportService {

    ReportResponse getReport(LocalDate from, LocalDate to, Long receptionistId);

    byte[] generatePdf(LocalDate from, LocalDate to, Long receptionistId);

    byte[] generateCsv(LocalDate from, LocalDate to, Long receptionistId);
}