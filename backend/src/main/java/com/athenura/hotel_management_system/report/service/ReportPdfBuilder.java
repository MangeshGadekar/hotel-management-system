package com.athenura.hotel_management_system.report.service;

import com.athenura.hotel_management_system.report.dto.ReportResponse;
import com.athenura.hotel_management_system.report.dto.ReportResponse.BookingRow;
import com.athenura.hotel_management_system.report.dto.ReportResponse.ReceptionistRow;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Component
public class ReportPdfBuilder {

    private static final Color BRAND = new Color(0xD9, 0x6B, 0x43);
    private static final Color LIGHT = new Color(0xF8, 0xFA, 0xFC);
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final DateTimeFormatter DATE_SHORT = DateTimeFormatter.ofPattern("dd/MM/yy");

    private final Font title = new Font(Font.HELVETICA, 18, Font.BOLD, BRAND);
    private final Font sub = new Font(Font.HELVETICA, 9, Font.NORMAL, Color.DARK_GRAY);
    private final Font h2 = new Font(Font.HELVETICA, 12, Font.BOLD, Color.BLACK);
    private final Font th = new Font(Font.HELVETICA, 8, Font.BOLD, Color.WHITE);
    private final Font td = new Font(Font.HELVETICA, 8, Font.NORMAL, Color.BLACK);


    private String money(BigDecimal v) {
        NumberFormat nf = NumberFormat.getNumberInstance(new Locale("en", "IN"));
        nf.setMaximumFractionDigits(0);
        return "Rs. " + nf.format(v == null ? BigDecimal.ZERO : v);
    }

    private Paragraph heading(String text) {
        Paragraph p = new Paragraph(text, h2);
        p.setSpacingBefore(14);
        p.setSpacingAfter(8);
        return p;
    }

    public byte[] build(ReportResponse r) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4.rotate(), 28, 28, 28, 28);
            PdfWriter.getInstance(doc, out);
            doc.open();

            doc.add(new Paragraph("Paradise - Booking & Payment Report", title));
            String who = r.getReceptionistId() == null ? "All receptionists"
                    : "Receptionist: " + (r.getReceptionistName() != null ? r.getReceptionistName() : r.getReceptionistId());
            doc.add(new Paragraph("Period: " + r.getFrom().format(DATE) + " to " + r.getTo().format(DATE) + "   |   " + who, sub));
            doc.add(Chunk.NEWLINE);

            PdfPTable s = new PdfPTable(5);
            s.setWidthPercentage(100);
            s.addCell(kpi("Total Bookings", String.valueOf(r.getSummary().getTotalBookings())));
            s.addCell(kpi("Cancelled", String.valueOf(r.getSummary().getCancelledBookings())));
            s.addCell(kpi("Total Amount", money(r.getSummary().getTotalAmount())));
            s.addCell(kpi("Total Paid", money(r.getSummary().getTotalPaid())));
            s.addCell(kpi("Balance Due", money(r.getSummary().getTotalBalance())));
            doc.add(s);

            if (r.getReceptionistId() == null && !r.getByReceptionist().isEmpty()) {
                doc.add(heading("Receptionist wise summary"));
                PdfPTable t = table(new float[]{3, 1, 1, 2, 2, 2},
                        "Receptionist", "Bookings", "Cancelled", "Total", "Paid", "Balance");
                for (ReceptionistRow x : r.getByReceptionist()) {
                    t.addCell(c(x.getReceptionistName()));
                    t.addCell(c(String.valueOf(x.getBookings())));
                    t.addCell(c(String.valueOf(x.getCancelled())));
                    t.addCell(c(money(x.getTotalAmount())));
                    t.addCell(c(money(x.getTotalPaid())));
                    t.addCell(c(money(x.getTotalBalance())));
                }
                doc.add(t);
            }

            doc.add(heading("Booking details"));
            PdfPTable t = table(new float[]{2.2f, 1.3f, 2.2f, 1.3f, 1.3f, 1.3f, 1.6f, 2f, 1.5f, 1.5f, 1.5f},
                    "Booking Ref", "Booked", "Guest", "Rooms", "Check-In", "Check-Out",
                    "Status", "Receptionist", "Total", "Paid", "Balance");
            for (BookingRow b : r.getBookings()) {
                t.addCell(c(b.getBookingReference()));
                t.addCell(c(b.getBookedAt() != null ? b.getBookedAt().format(DATE_SHORT) : ""));
                t.addCell(c(b.getGuestName()));
                t.addCell(c(b.getRooms()));
                t.addCell(c(b.getCheckInDate() != null ? b.getCheckInDate().format(DATE_SHORT) : ""));
                t.addCell(c(b.getCheckOutDate() != null ? b.getCheckOutDate().format(DATE_SHORT) : ""));
                t.addCell(c(b.getStatus()));
                t.addCell(c(b.getReceptionistId() == null ? "Online / Guest" : b.getReceptionistName()));
                t.addCell(c(money(b.getTotalAmount())));
                t.addCell(c(money(b.getTotalPaid())));
                t.addCell(c(money(b.getBalanceDue())));
            }
            doc.add(t);

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Could not generate report PDF", e);
        }
    }

    private PdfPCell kpi(String label, String value) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(LIGHT);
        cell.setPadding(8);
        cell.addElement(new Paragraph(label, sub));
        cell.addElement(new Paragraph(value, h2));
        return cell;
    }

    private PdfPTable table(float[] widths, String... headers) throws DocumentException {
        PdfPTable t = new PdfPTable(widths.length);
        t.setWidthPercentage(100);
        t.setWidths(widths);
        t.setHeaderRows(1);
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, th));
            cell.setBackgroundColor(BRAND);
            cell.setPadding(5);
            t.addCell(cell);
        }
        return t;
    }

    private PdfPCell c(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text == null ? "" : text, td));
        cell.setPadding(4);
        return cell;
    }
}