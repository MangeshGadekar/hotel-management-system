package com.athenura.hotel_management_system.report.controller;

import com.athenura.hotel_management_system.common.entity.Users;
import com.athenura.hotel_management_system.common.enums.Role;
import com.athenura.hotel_management_system.common.repository.UserRepo;
import com.athenura.hotel_management_system.report.dto.ReportResponse;
import com.athenura.hotel_management_system.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;


@RestController
@RequiredArgsConstructor
@RequestMapping({"/admin/reports", "/reception/reports"})
public class ReportController {

    private final ReportService reportService;
    private final UserRepo userRepo;

    @GetMapping
    public ResponseEntity<ReportResponse> report(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long receptionistId,
            Authentication auth) {
        return ResponseEntity.ok(reportService.getReport(from, to, scope(auth, receptionistId)));
    }

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> pdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long receptionistId,
            Authentication auth) {
        byte[] data = reportService.generatePdf(from, to, scope(auth, receptionistId));
        return file(data, MediaType.APPLICATION_PDF_VALUE, "report_" + from + "_to_" + to + ".pdf");
    }

    @GetMapping("/csv")
    public ResponseEntity<byte[]> csv(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long receptionistId,
            Authentication auth) {
        byte[] data = reportService.generateCsv(from, to, scope(auth, receptionistId));
        return file(data, "text/csv; charset=UTF-8", "report_" + from + "_to_" + to + ".csv");
    }

    private Long scope(Authentication auth, Long requestedId) {
        Users me = userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        if (me.getRole() == Role.ADMIN) {
            return requestedId;
        }
        return me.getId();
    }

    private ResponseEntity<byte[]> file(byte[] data, String contentType, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(data);
    }
}
