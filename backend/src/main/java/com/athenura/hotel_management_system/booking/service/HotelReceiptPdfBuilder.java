package com.athenura.hotel_management_system.booking.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Slf4j
@Component
public class HotelReceiptPdfBuilder {

    private static final Color DARK_NAVY = new Color(15, 23, 42);
    private static final Color SLATE_TEXT = new Color(51, 65, 85);
    private static final Color MUTED_GRAY = new Color(100, 116, 139);
    private static final Color BORDER_GRAY = new Color(203, 213, 225);
    private static final Color BAR_BG = new Color(241, 245, 249);
    private static final Color ALERT_RED = new Color(220, 38, 38);
    private static final Color SUCCESS_GREEN = new Color(16, 185, 129);

    private static final NumberFormat INR_FORMAT = NumberFormat.getNumberInstance(new Locale("en", "IN"));

    static {
        INR_FORMAT.setMaximumFractionDigits(2);
        INR_FORMAT.setMinimumFractionDigits(2);
    }

    public static String formatInr(BigDecimal amount) {
        if (amount == null) return "0.00";
        return INR_FORMAT.format(amount.setScale(2, RoundingMode.HALF_UP));
    }

    public static record LineItem(
            String description,
            BigDecimal unitPrice,
            String qty,
            BigDecimal taxPct,
            BigDecimal amount
    ) {}

    public static record InvoiceMeta(
            String guestName,
            String phone,
            String email,
            String idProof,
            String roomDisplay,
            String checkInDate,
            String checkOutDate,
            long nights,
            String bookingRef,
            String invoiceNumber,
            String paymentMode,
            String preparedBy,
            String discountReason
    ) {}

    public static record FinancialSummary(
            BigDecimal taxableSubtotal,
            BigDecimal taxAmount,
            BigDecimal grossTotal,
            BigDecimal couponDiscount,
            String couponCode,
            BigDecimal discountAmount,
            String discountReason,
            BigDecimal netPayable,
            BigDecimal paidAmount,
            BigDecimal balanceAmount
    ) {}

    public byte[] renderReceipt(
            String billTitle,
            InvoiceMeta meta,
            List<LineItem> items,
            FinancialSummary finances
    ) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 30, 30, 25, 25);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            boolean isRefundDoc = billTitle != null &&
                    (billTitle.toUpperCase().contains("REFUND") || billTitle.toUpperCase().contains("CANCEL"));

            // --- 1. TOP BRAND HEADER ---
            PdfPTable topHeader = new PdfPTable(2);
            topHeader.setWidthPercentage(100);
            topHeader.setWidths(new float[]{55f, 45f});
            topHeader.setSpacingAfter(6f);

            PdfPCell brandCell = new PdfPCell();
            brandCell.setBorder(Rectangle.NO_BORDER);
            brandCell.addElement(new Paragraph("HOTEL ATHITYA", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(217, 107, 67))));
            Paragraph tagline = new Paragraph("Luxury Stay & Suites • Experience Hospitality", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, MUTED_GRAY));
            tagline.setSpacingAfter(4f);
            brandCell.addElement(tagline);
            topHeader.addCell(brandCell);

            PdfPCell contactCell = new PdfPCell();
            contactCell.setBorder(Rectangle.NO_BORDER);
            contactCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph contactPara = new Paragraph();
            contactPara.setAlignment(Element.ALIGN_RIGHT);
            contactPara.add(new Chunk("Naik Nagar, Chandranagar, Rameshwari, Nagpur-440027\n", FontFactory.getFont(FontFactory.HELVETICA, 8, SLATE_TEXT)));
            contactPara.add(new Chunk("Phone: +91 9373369332\n", FontFactory.getFont(FontFactory.HELVETICA, 8, SLATE_TEXT)));
            contactPara.add(new Chunk("athitya@gmail.com | www.athitya.com", FontFactory.getFont(FontFactory.HELVETICA, 8, SLATE_TEXT)));
            contactCell.addElement(contactPara);
            topHeader.addCell(contactCell);

            document.add(topHeader);
            addSolidRule(document, 1.5f, DARK_NAVY);

            // --- 2. DOCUMENT TITLE ---
            Paragraph docTitle = new Paragraph(billTitle.toUpperCase(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, DARK_NAVY));
            docTitle.setAlignment(Element.ALIGN_CENTER);
            docTitle.setSpacingBefore(4f);
            docTitle.setSpacingAfter(6f);
            document.add(docTitle);
            addSolidRule(document, 1.0f, DARK_NAVY);

            // --- 3. METADATA GRID ---
            PdfPTable metaGrid = new PdfPTable(4);
            metaGrid.setWidthPercentage(100);
            metaGrid.setWidths(new float[]{18f, 32f, 18f, 32f});
            metaGrid.setSpacingBefore(6f);
            metaGrid.setSpacingAfter(10f);

            // Row 1: Billed To & Booking Ref
            addMetaField(metaGrid, "Billed To", ": " + (meta.guestName() != null ? meta.guestName() : "Guest"), true);
            addMetaField(metaGrid, "Booking Ref", ": " + (meta.bookingRef() != null ? meta.bookingRef() : "—"), true);

            // Row 2: Room Assigned & Date
            addMetaField(metaGrid, "Room Assigned", ": " + (meta.roomDisplay() != null ? meta.roomDisplay() : "—"), false);
            String nowTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy hh:mm a"));
            addMetaField(metaGrid, isRefundDoc ? "Refund Date" : "Date", ": " + nowTime, false);

            // Row 3: Check-In & Check-Out
            addMetaField(metaGrid, "Check-In", ": " + (meta.checkInDate() != null ? meta.checkInDate() : "—"), false);
            addMetaField(metaGrid, "Check-Out", ": " + meta.checkOutDate() + " (" + meta.nights() + (meta.nights() == 1 ? " Night)" : " Nights)"), false);

            // Row 4: Contact Details & ID Proof
            addMetaField(metaGrid, "Contact Details", ": " + (meta.phone() != null && !meta.phone().isBlank() ? meta.phone() : (meta.email() != null ? meta.email() : "—")), false);
            addMetaField(metaGrid, "ID Proof", ": " + (meta.idProof() != null ? meta.idProof() : "On File"), false);

            document.add(metaGrid);
            addSolidRule(document, 0.75f, DARK_NAVY);

            // --- 4. LINE ITEMS TABLE ---
            PdfPTable itemsTable = new PdfPTable(6);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[]{8f, 44f, 16f, 10f, 10f, 12f});
            itemsTable.setSpacingBefore(4f);
            itemsTable.setSpacingAfter(8f);

            String[] tableHeaders = {"Item #", "Description", "Unit Price", "Qty", "Tax(%)", "Amount"};
            for (int i = 0; i < tableHeaders.length; i++) {
                PdfPCell th = new PdfPCell(new Phrase(tableHeaders[i], FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8f, DARK_NAVY)));
                th.setBorder(Rectangle.BOTTOM);
                th.setBorderColor(DARK_NAVY);
                th.setBorderWidth(0.75f);
                th.setPaddingBottom(5f);
                if (i >= 2) th.setHorizontalAlignment(Element.ALIGN_RIGHT);
                itemsTable.addCell(th);
            }

            int index = 1;
            for (LineItem item : items) {
                PdfPCell cIndex = makeCell(String.valueOf(index++), Element.ALIGN_LEFT, false);
                PdfPCell cDesc = makeCell(item.description(), Element.ALIGN_LEFT, true);
                PdfPCell cRate = makeCell(formatInr(item.unitPrice()), Element.ALIGN_RIGHT, false);
                PdfPCell cQty = makeCell(item.qty(), Element.ALIGN_RIGHT, false);
                PdfPCell cTax = makeCell((item.taxPct() != null ? item.taxPct().stripTrailingZeros().toPlainString() : "0") + "%", Element.ALIGN_RIGHT, false);
                PdfPCell cAmt = makeCell(formatInr(item.amount()), Element.ALIGN_RIGHT, true);

                itemsTable.addCell(cIndex);
                itemsTable.addCell(cDesc);
                itemsTable.addCell(cRate);
                itemsTable.addCell(cQty);
                itemsTable.addCell(cTax);
                itemsTable.addCell(cAmt);
            }
            document.add(itemsTable);
            addSolidRule(document, 0.75f, BORDER_GRAY);

            // --- 5. FOOTER GRID (LEDGER & SETTLEMENT) ---
            PdfPTable footerGrid = new PdfPTable(2);
            footerGrid.setWidthPercentage(100);
            footerGrid.setWidths(new float[]{46f, 54f});
            footerGrid.setSpacingBefore(6f);
            footerGrid.setSpacingAfter(15f);

            // Left Side: Operational Info
            PdfPCell leftFoot = new PdfPCell();
            leftFoot.setBorder(Rectangle.NO_BORDER);

            PdfPTable staffTable = new PdfPTable(2);
            staffTable.setWidthPercentage(100);
            staffTable.setWidths(new float[]{42f, 58f});

            if (isRefundDoc) {
                addSimpleRow(staffTable, "Refund Method", ": " + (meta.paymentMode() != null ? meta.paymentMode() : "ORIGINAL PAYMENT SOURCE"), false);
                addSimpleRow(staffTable, "Refund Amount", ": Rs. " + formatInr(finances.paidAmount()), true);

                // Show Processed By ONLY if explicitly prepared by staff; hide completely if online/self-service
                boolean hasStaffPreparer = meta.preparedBy() != null
                        && !meta.preparedBy().isBlank()
                        && !"ONLINE".equalsIgnoreCase(meta.preparedBy().trim())
                        && !"Front Desk Staff".equalsIgnoreCase(meta.preparedBy().trim());

                if (hasStaffPreparer) {
                    addSimpleRow(staffTable, "Processed By", ": " + meta.preparedBy(), true);
                }
            } else {
                addSimpleRow(staffTable, "Payment Mode", ": " + (meta.paymentMode() != null ? meta.paymentMode() : "CASH"), false);
                addSimpleRow(staffTable, "Paid Amount", ": Rs. " + formatInr(finances.paidAmount()), true);

                boolean hasStaffPreparer = meta.preparedBy() != null
                        && !meta.preparedBy().isBlank()
                        && !"ONLINE".equalsIgnoreCase(meta.preparedBy().trim());

                if (hasStaffPreparer) {
                    addSimpleRow(staffTable, "Bill Prepared By", ": " + meta.preparedBy(), true);
                }
            }

            leftFoot.addElement(staffTable);
            footerGrid.addCell(leftFoot);

            // Right Side: Financial Breakdown
            PdfPCell rightFoot = new PdfPCell();
            rightFoot.setBorder(Rectangle.NO_BORDER);

            PdfPTable ledgerTable = new PdfPTable(3);
            ledgerTable.setWidthPercentage(100);
            ledgerTable.setWidths(new float[]{55f, 5f, 40f});

            if (isRefundDoc) {
                // Itemized Breakdown for Refund Slip
                addLedgerRow(ledgerTable, "Taxable Subtotal", ":", formatInr(finances.taxableSubtotal()), false, null);
                addLedgerRow(ledgerTable, "Total GST (18%)", ":", formatInr(finances.taxAmount()), false, null);
                addLedgerRow(ledgerTable, "Total Booking Value", ":", formatInr(finances.grossTotal()), true, null);

                if (finances.couponDiscount() != null && finances.couponDiscount().compareTo(BigDecimal.ZERO) > 0) {
                    String cpnLabel = (finances.couponCode() != null && !finances.couponCode().isBlank())
                            ? "- Less Promo/Coupon (" + finances.couponCode() + ")"
                            : "- Less Promo/Coupon";
                    addLedgerRow(ledgerTable, cpnLabel, ":", "- " + formatInr(finances.couponDiscount()), false, MUTED_GRAY);
                }

                // Highlighted Green Refund Row
                PdfPCell bLabel = new PdfPCell(new Phrase("Net Refund Issued", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, SUCCESS_GREEN)));
                bLabel.setBackgroundColor(BAR_BG);
                bLabel.setBorder(Rectangle.NO_BORDER);
                bLabel.setPadding(4f);

                PdfPCell bColon = new PdfPCell(new Phrase(":", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, SUCCESS_GREEN)));
                bColon.setBackgroundColor(BAR_BG);
                bColon.setBorder(Rectangle.NO_BORDER);
                bColon.setPadding(4f);

                PdfPCell bVal = new PdfPCell(new Phrase("Rs. " + formatInr(finances.paidAmount()), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, SUCCESS_GREEN)));
                bVal.setBackgroundColor(BAR_BG);
                bVal.setBorder(Rectangle.NO_BORDER);
                bVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
                bVal.setPadding(4f);

                ledgerTable.addCell(bLabel);
                ledgerTable.addCell(bColon);
                ledgerTable.addCell(bVal);

            } else {
                // Standard Check-in / Final Checkout Accounting
                addLedgerRow(ledgerTable, "Taxable Subtotal", ":", formatInr(finances.taxableSubtotal()), false, null);
                addLedgerRow(ledgerTable, "Total Tax (GST)", ":", formatInr(finances.taxAmount()), false, null);
                addLedgerRow(ledgerTable, "Total Bill (Gross)", ":", formatInr(finances.grossTotal()), true, null);

                if (finances.couponDiscount() != null && finances.couponDiscount().compareTo(BigDecimal.ZERO) > 0) {
                    String cpnLabel = (finances.couponCode() != null && !finances.couponCode().isBlank())
                            ? "- Less Coupon Discount (" + finances.couponCode() + ")"
                            : "- Less Coupon Discount";
                    addLedgerRow(ledgerTable, cpnLabel, ":", "- " + formatInr(finances.couponDiscount()), false, SUCCESS_GREEN);
                }

                if (finances.discountAmount() != null && finances.discountAmount().compareTo(BigDecimal.ZERO) > 0) {
                    addLedgerRow(ledgerTable, "- Less Discount / Concession", ":", "- " + formatInr(finances.discountAmount()), false, null);
                    String reason = finances.discountReason() != null && !finances.discountReason().isBlank()
                            ? finances.discountReason() : "Desk Concession";
                    addLedgerRow(ledgerTable, "  Discount Reason", ":", reason, false, MUTED_GRAY);
                }

                addLedgerRow(ledgerTable, "Net Payable Amount", ":", formatInr(finances.netPayable()), true, null);
                addLedgerRow(ledgerTable, "Less Paid Amount", ":", formatInr(finances.paidAmount()), false, null);

                boolean isFullySettled = finances.balanceAmount() == null || finances.balanceAmount().compareTo(BigDecimal.ZERO) <= 0;
                Color balanceTextColor = isFullySettled ? DARK_NAVY : ALERT_RED;
                PdfPCell bLabel = new PdfPCell(new Phrase("Balance Due", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, balanceTextColor)));
                bLabel.setBackgroundColor(BAR_BG);
                bLabel.setBorder(Rectangle.NO_BORDER);
                bLabel.setPadding(4f);

                PdfPCell bColon = new PdfPCell(new Phrase(":", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, balanceTextColor)));
                bColon.setBackgroundColor(BAR_BG);
                bColon.setBorder(Rectangle.NO_BORDER);
                bColon.setPadding(4f);

                BigDecimal finalBalance = finances.balanceAmount() != null ? finances.balanceAmount().max(BigDecimal.ZERO) : BigDecimal.ZERO;
                PdfPCell bVal = new PdfPCell(new Phrase(formatInr(finalBalance), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, balanceTextColor)));
                bVal.setBackgroundColor(BAR_BG);
                bVal.setBorder(Rectangle.NO_BORDER);
                bVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
                bVal.setPadding(4f);

                ledgerTable.addCell(bLabel);
                ledgerTable.addCell(bColon);
                ledgerTable.addCell(bVal);
            }

            rightFoot.addElement(ledgerTable);
            footerGrid.addCell(rightFoot);

            document.add(footerGrid);

            // --- 6. SIGNATURE BLOCK ---
            PdfPTable signTable = new PdfPTable(2);
            signTable.setWidthPercentage(100);
            signTable.setWidths(new float[]{50f, 50f});
            signTable.setSpacingBefore(12f);

            PdfPCell thankYouCell = new PdfPCell(new Phrase(
                    isRefundDoc ? "We hope to welcome you again at Hotel Athitya!" : "Thank You for choosing Hotel Athitya!",
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, DARK_NAVY)
            ));
            thankYouCell.setBorder(Rectangle.NO_BORDER);
            thankYouCell.setVerticalAlignment(Element.ALIGN_BOTTOM);
            signTable.addCell(thankYouCell);

            PdfPCell signCell = new PdfPCell();
            signCell.setBorder(Rectangle.NO_BORDER);
            signCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph sigPara = new Paragraph();
            sigPara.setAlignment(Element.ALIGN_RIGHT);
            sigPara.add(new Chunk("Authorized Signatory\n", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, DARK_NAVY)));
            sigPara.add(new Chunk("Hotel Athitya Management", FontFactory.getFont(FontFactory.HELVETICA, 7.5f, MUTED_GRAY)));
            signCell.addElement(sigPara);
            signTable.addCell(signCell);

            document.add(signTable);

            // --- 7. FOOTER BAR ---
            addSolidRule(document, 1.0f, DARK_NAVY);
            PdfPTable baseMeta = new PdfPTable(2);
            baseMeta.setWidthPercentage(100);
            baseMeta.setWidths(new float[]{50f, 50f});
            baseMeta.setSpacingBefore(3f);

            PdfPCell printBy = new PdfPCell(new Phrase("Printed By : Hotel Athitya Desk System", FontFactory.getFont(FontFactory.HELVETICA, 7.5f, MUTED_GRAY)));
            printBy.setBorder(Rectangle.NO_BORDER);
            baseMeta.addCell(printBy);

            PdfPCell pageNum = new PdfPCell(new Phrase("Page 1 of 1", FontFactory.getFont(FontFactory.HELVETICA, 7.5f, MUTED_GRAY)));
            pageNum.setBorder(Rectangle.NO_BORDER);
            pageNum.setHorizontalAlignment(Element.ALIGN_RIGHT);
            baseMeta.addCell(pageNum);

            document.add(baseMeta);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed rendering invoice PDF: {}", e.getMessage());
            throw new RuntimeException("Error rendering invoice PDF: " + e.getMessage(), e);
        }
    }

    private void addSolidRule(Document doc, float width, Color color) throws DocumentException {
        PdfPTable line = new PdfPTable(1);
        line.setWidthPercentage(100);
        PdfPCell c = new PdfPCell();
        c.setBorder(Rectangle.BOTTOM);
        c.setBorderColor(color);
        c.setBorderWidth(width);
        c.setFixedHeight(1f);
        line.addCell(c);
        doc.add(line);
    }

    private void addMetaField(PdfPTable table, String label, String value, boolean isBold) {
        Font lFont = FontFactory.getFont(FontFactory.HELVETICA, 8.5f, MUTED_GRAY);
        Font vFont = isBold
                ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8.5f, DARK_NAVY)
                : FontFactory.getFont(FontFactory.HELVETICA, 8.5f, SLATE_TEXT);

        PdfPCell cLabel = new PdfPCell(new Phrase(label, lFont));
        cLabel.setBorder(Rectangle.NO_BORDER);
        cLabel.setPaddingBottom(3.5f);

        PdfPCell cVal = new PdfPCell(new Phrase(value, vFont));
        cVal.setBorder(Rectangle.NO_BORDER);
        cVal.setPaddingBottom(3.5f);

        table.addCell(cLabel);
        table.addCell(cVal);
    }

    private PdfPCell makeCell(String text, int align, boolean isBold) {
        Font f = isBold
                ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8f, DARK_NAVY)
                : FontFactory.getFont(FontFactory.HELVETICA, 8f, SLATE_TEXT);
        PdfPCell c = new PdfPCell(new Phrase(text, f));
        c.setBorder(Rectangle.NO_BORDER);
        c.setHorizontalAlignment(align);
        c.setPaddingTop(3.5f);
        c.setPaddingBottom(3.5f);
        return c;
    }

    private void addSimpleRow(PdfPTable table, String label, String val, boolean isBold) {
        Font lFont = FontFactory.getFont(FontFactory.HELVETICA, 8.5f, MUTED_GRAY);
        Font vFont = isBold
                ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8.5f, DARK_NAVY)
                : FontFactory.getFont(FontFactory.HELVETICA, 8.5f, SLATE_TEXT);

        PdfPCell c1 = new PdfPCell(new Phrase(label, lFont));
        c1.setBorder(Rectangle.NO_BORDER);
        c1.setPaddingBottom(3f);

        PdfPCell c2 = new PdfPCell(new Phrase(val, vFont));
        c2.setBorder(Rectangle.NO_BORDER);
        c2.setPaddingBottom(3f);

        table.addCell(c1);
        table.addCell(c2);
    }

    private void addLedgerRow(PdfPTable table, String label, String colon, String val, boolean isBold, Color overrideColor) {
        Color c = overrideColor != null ? overrideColor : DARK_NAVY;
        Font f = isBold
                ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8.5f, c)
                : FontFactory.getFont(FontFactory.HELVETICA, 8.5f, c);

        PdfPCell c1 = new PdfPCell(new Phrase(label, f));
        c1.setBorder(Rectangle.NO_BORDER);
        c1.setPaddingBottom(2.5f);

        PdfPCell c2 = new PdfPCell(new Phrase(colon, f));
        c2.setBorder(Rectangle.NO_BORDER);
        c2.setPaddingBottom(2.5f);

        PdfPCell c3 = new PdfPCell(new Phrase(val, f));
        c3.setBorder(Rectangle.NO_BORDER);
        c3.setHorizontalAlignment(Element.ALIGN_RIGHT);
        c3.setPaddingBottom(2.5f);

        table.addCell(c1);
        table.addCell(c2);
        table.addCell(c3);
    }
}