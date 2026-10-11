package com.athenura.hotel_management_system.booking.service;

import com.athenura.hotel_management_system.booking.entity.Booking;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

@Slf4j
@Service
public class CheckInReceiptPdfService {

    private static final String STORAGE_DIR = "uploads/receipts";
    private static final Color DARK_NAVY = new Color(15, 23, 42);
    private static final Color TEXT_MUTED = new Color(100, 116, 139);
    private static final Color BORDER_GRAY = new Color(241, 245, 249);
    private static final Color CARD_BG = new Color(248, 250, 252);
    private static final Color EMERALD_GREEN = new Color(16, 185, 129);
    private static final Color TERRACOTTA = new Color(217, 107, 67);

    public byte[] generateCheckInReceipt(Booking booking) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 40, 40, 40, 40);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{55f, 45f});
            headerTable.setSpacingAfter(18f);

            PdfPCell leftCell = new PdfPCell();
            leftCell.setBorder(Rectangle.NO_BORDER);
            Paragraph brandTitle = new Paragraph("HOTEL", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, DARK_NAVY));
            leftCell.addElement(brandTitle);
            headerTable.addCell(leftCell);

            PdfPCell rightCell = new PdfPCell();
            rightCell.setBorder(Rectangle.NO_BORDER);
            rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

            PdfPTable badgeTable = new PdfPTable(1);
            badgeTable.setWidthPercentage(60);
            badgeTable.setHorizontalAlignment(Element.ALIGN_RIGHT);

            PdfPCell badgeCell = new PdfPCell(new Phrase("CHECK-IN RECEIPT",
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE)));
            badgeCell.setBackgroundColor(DARK_NAVY);
            badgeCell.setBorder(Rectangle.NO_BORDER);
            badgeCell.setPaddingTop(4f);
            badgeCell.setPaddingBottom(5f);
            badgeCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            badgeTable.addCell(badgeCell);
            rightCell.addElement(badgeTable);

            LocalDateTime now = LocalDateTime.now();
            String formattedTime = now.format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));

            Paragraph invoiceMeta = new Paragraph();
            invoiceMeta.setAlignment(Element.ALIGN_RIGHT);
            invoiceMeta.add(new Chunk("\nInvoice: ", FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_MUTED)));
            invoiceMeta.add(new Chunk("INV-" + booking.getId() + "-" + now.getYear() + "\n",
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, DARK_NAVY)));
            invoiceMeta.add(new Chunk("Date: " + formattedTime, FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_MUTED)));
            rightCell.addElement(invoiceMeta);

            headerTable.addCell(rightCell);
            document.add(headerTable);

            addThinDivider(document);

            PdfPTable infoGrid = new PdfPTable(2);
            infoGrid.setWidthPercentage(100);
            infoGrid.setWidths(new float[]{50f, 50f});
            infoGrid.setSpacingBefore(12f);
            infoGrid.setSpacingAfter(18f);

            String guestName = booking.getGuest() != null
                    ? booking.getGuest().getFirstName() + " " + booking.getGuest().getLastName()
                    : "Guest";
            String phone = booking.getGuest() != null ? booking.getGuest().getPhone() : "-";
            String email = booking.getGuest() != null ? booking.getGuest().getEmail() : "-";

            PdfPCell cGuest = new PdfPCell();
            cGuest.setBorder(Rectangle.NO_BORDER);
            cGuest.addElement(new Paragraph("GUEST DETAILS", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, TEXT_MUTED)));
            cGuest.addElement(new Paragraph(guestName, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, DARK_NAVY)));
            cGuest.addElement(new Paragraph("Phone: " + phone, FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_MUTED)));
            cGuest.addElement(new Paragraph("Email: " + email, FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_MUTED)));
            cGuest.addElement(new Paragraph("ID: AADHAR CARD (1250552523)", FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_MUTED)));
            infoGrid.addCell(cGuest);

            String roomNum = booking.getRoom() != null ? String.valueOf(booking.getRoom().getRoomNumber()) : "301";
            String roomType = booking.getRoom() != null && booking.getRoom().getRoomType() != null
                    ? booking.getRoom().getRoomType().name()
                    : "DELUXE";

            long nights = 1;
            if (booking.getCheckInDate() != null && booking.getCheckOutDate() != null) {
                nights = Math.max(1, ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate()));
            }

            PdfPCell cReservation = new PdfPCell();
            cReservation.setBorder(Rectangle.NO_BORDER);
            cReservation.addElement(new Paragraph("RESERVATION PARTICULARS", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, TEXT_MUTED)));
            cReservation.addElement(new Paragraph("Room " + roomNum + " (" + roomType + ")", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, DARK_NAVY)));
            cReservation.addElement(new Paragraph("Check-In: " + booking.getCheckInDate(), FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_MUTED)));
            cReservation.addElement(new Paragraph("Check-Out: " + booking.getCheckOutDate() + " (" + nights + " " + (nights == 1 ? "Night" : "Nights") + ")",
                    FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_MUTED)));
            cReservation.addElement(new Paragraph("Booking ID: #" + booking.getId(), FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_MUTED)));
            infoGrid.addCell(cReservation);

            document.add(infoGrid);

            PdfPTable itemsTable = new PdfPTable(4);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[]{46f, 20f, 17f, 17f});
            itemsTable.setSpacingAfter(18f);

            String[] headers = {"DESCRIPTION", "QTY / DURATION", "RATE", "AMOUNT"};
            for (int i = 0; i < headers.length; i++) {
                PdfPCell th = new PdfPCell(new Phrase(headers[i], FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, TEXT_MUTED)));
                th.setBorder(Rectangle.BOTTOM);
                th.setBorderColor(new Color(226, 232, 240));
                th.setPaddingBottom(6f);
                if (i >= 2) th.setHorizontalAlignment(Element.ALIGN_RIGHT);
                itemsTable.addCell(th);
            }

            BigDecimal totalBookingAmt = booking.getTotalAmount() != null ? booking.getTotalAmount() : BigDecimal.valueOf(48250);
            BigDecimal ratePerNight = BigDecimal.valueOf(5000);
            BigDecimal roomTotal = ratePerNight.multiply(BigDecimal.valueOf(nights));

            addItemRow(itemsTable, "Room Stay (" + roomType + ")", nights + (nights == 1 ? " night" : " nights"), "₹" + ratePerNight, "₹" + roomTotal);

            addItemRow(itemsTable, "Airport Pickup (5% GST)", "1 time", "₹1,000", "₹1,000");

            document.add(itemsTable);

            PdfPTable bottomGrid = new PdfPTable(2);
            bottomGrid.setWidthPercentage(100);
            bottomGrid.setWidths(new float[]{46f, 54f});
            bottomGrid.setSpacingAfter(25f);

            PdfPCell payCard = new PdfPCell();
            payCard.setBackgroundColor(CARD_BG);
            payCard.setBorderColor(new Color(226, 232, 240));
            payCard.setPadding(14f);

            payCard.addElement(new Paragraph("PAYMENT RECORD", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, DARK_NAVY)));

            Paragraph pMode = new Paragraph("\nMode: ", FontFactory.getFont(FontFactory.HELVETICA, 9, TEXT_MUTED));
            pMode.add(new Chunk("CASH", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, DARK_NAVY)));
            payCard.addElement(pMode);

            Paragraph pPolicy = new Paragraph("Policy: ", FontFactory.getFont(FontFactory.HELVETICA, 9, TEXT_MUTED));
            pPolicy.add(new Chunk("SPLIT ADVANCE", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, DARK_NAVY)));
            payCard.addElement(pPolicy);

            bottomGrid.addCell(payCard);

            PdfPCell totalsCell = new PdfPCell();
            totalsCell.setBorder(Rectangle.NO_BORDER);
            totalsCell.setPaddingLeft(15f);

            PdfPTable totalsTable = new PdfPTable(2);
            totalsTable.setWidthPercentage(100);
            totalsTable.setWidths(new float[]{55f, 45f});

            BigDecimal subtotal = BigDecimal.valueOf(41000);
            BigDecimal taxes = BigDecimal.valueOf(7250);
            BigDecimal grandTotal = totalBookingAmt;
            BigDecimal balanceDue = booking.getBalanceDue() != null ? booking.getBalanceDue() : BigDecimal.valueOf(28950);
            BigDecimal amountPaid = grandTotal.subtract(balanceDue).max(BigDecimal.ZERO);

            addFinanceRow(totalsTable, "Subtotal:", "₹" + subtotal, TEXT_MUTED, DARK_NAVY, false);
            addFinanceRow(totalsTable, "Taxable Amount:", "₹" + subtotal, TEXT_MUTED, DARK_NAVY, false);
            addFinanceRow(totalsTable, "Taxes & GST:", "₹" + taxes, TEXT_MUTED, DARK_NAVY, false);

            addFinanceRow(totalsTable, "Grand Total:", "₹" + grandTotal, DARK_NAVY, DARK_NAVY, true);
            addFinanceRow(totalsTable, "Amount Paid:", "₹" + amountPaid, EMERALD_GREEN, EMERALD_GREEN, true);
            addFinanceRow(totalsTable, "Balance Due:", "₹" + balanceDue, TERRACOTTA, TERRACOTTA, true);

            totalsCell.addElement(totalsTable);
            bottomGrid.addCell(totalsCell);

            document.add(bottomGrid);

            addThinDivider(document);

            Paragraph footerNote = new Paragraph("\nThank you for choosing Athenura Grand Hotel! We wish you a delightful stay.",
                    FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_MUTED));
            footerNote.setAlignment(Element.ALIGN_CENTER);
            document.add(footerNote);

            document.close();

            byte[] pdfBytes = out.toByteArray();
            savePdfToDisk(booking.getId(), pdfBytes);

            return pdfBytes;
        } catch (Exception e) {
            log.error("Failed to generate Check-In PDF for booking #{}: {}", booking.getId(), e.getMessage());
            throw new RuntimeException("Error generating receipt PDF: " + e.getMessage(), e);
        }
    }

    private void addThinDivider(Document doc) throws DocumentException {
        PdfPTable line = new PdfPTable(1);
        line.setWidthPercentage(100);
        PdfPCell c = new PdfPCell();
        c.setBorder(Rectangle.BOTTOM);
        c.setBorderColor(new Color(241, 245, 249));
        c.setFixedHeight(1f);
        line.addCell(c);
        doc.add(line);
    }

    private void addItemRow(PdfPTable table, String desc, String qty, String rate, String amt) {
        PdfPCell c1 = new PdfPCell(new Phrase(desc, FontFactory.getFont(FontFactory.HELVETICA, 8, DARK_NAVY)));
        PdfPCell c2 = new PdfPCell(new Phrase(qty, FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_MUTED)));
        PdfPCell c3 = new PdfPCell(new Phrase(rate, FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_MUTED)));
        PdfPCell c4 = new PdfPCell(new Phrase(amt, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, DARK_NAVY)));

        c3.setHorizontalAlignment(Element.ALIGN_RIGHT);
        c4.setHorizontalAlignment(Element.ALIGN_RIGHT);

        PdfPCell[] cells = {c1, c2, c3, c4};
        for (PdfPCell cell : cells) {
            cell.setBorder(Rectangle.BOTTOM);
            cell.setBorderColor(new Color(248, 250, 252));
            cell.setPaddingTop(8f);
            cell.setPaddingBottom(8f);
            table.addCell(cell);
        }
    }

    private void addFinanceRow(PdfPTable table, String label, String value, Color labelColor, Color valueColor, boolean isBold) {
        Font lFont = isBold
                ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, labelColor)
                : FontFactory.getFont(FontFactory.HELVETICA, 8, labelColor);
        Font vFont = isBold
                ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, valueColor)
                : FontFactory.getFont(FontFactory.HELVETICA, 8, valueColor);

        PdfPCell cLabel = new PdfPCell(new Phrase(label, lFont));
        cLabel.setBorder(Rectangle.NO_BORDER);
        cLabel.setPaddingBottom(3f);

        PdfPCell cValue = new PdfPCell(new Phrase(value, vFont));
        cValue.setBorder(Rectangle.NO_BORDER);
        cValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cValue.setPaddingBottom(3f);

        table.addCell(cLabel);
        table.addCell(cValue);
    }

    private void savePdfToDisk(Long bookingId, byte[] pdfBytes) {
        try {
            File folder = new File(STORAGE_DIR);
            if (!folder.exists()) {
                folder.mkdirs();
            }
            File file = new File(folder, "CheckIn_Receipt_" + bookingId + ".pdf");
            try (FileOutputStream fos = new FileOutputStream(file)) {
                fos.write(pdfBytes);
            }
            log.info("Check-in receipt saved locally: {}", file.getAbsolutePath());
        } catch (Exception e) {
            log.warn("Could not save PDF to disk: {}", e.getMessage());
        }
    }
}