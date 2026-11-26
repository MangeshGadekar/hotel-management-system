package com.athenura.hotel_management_system.booking.service;

import com.athenura.hotel_management_system.booking.entity.Booking;
import com.athenura.hotel_management_system.booking.entity.BookingDiscount;
import com.athenura.hotel_management_system.booking.enums.BookingStatus;
import com.athenura.hotel_management_system.booking.repository.BookingDiscountRepository;
import com.athenura.hotel_management_system.booking.service.HotelReceiptPdfBuilder.*;
import com.athenura.hotel_management_system.extraservice.entity.ExtraService;
import com.athenura.hotel_management_system.payment.entity.Payment;
import com.athenura.hotel_management_system.payment.repository.PaymentRepository;
import com.athenura.hotel_management_system.room.entity.Room;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MasterReceiptPdfService {

    private final HotelReceiptPdfBuilder pdfBuilder;
    private final PaymentRepository paymentRepository;
    private final BookingDiscountRepository bookingDiscountRepository;

    private static class ServiceAggregator {
        String name;
        BigDecimal unitPrice;
        BigDecimal taxRate;
        int quantity = 0;
        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        ServiceAggregator(String name, BigDecimal unitPrice, BigDecimal taxRate) {
            this.name = name;
            this.unitPrice = unitPrice;
            this.taxRate = taxRate;
        }

        void add() {
            this.quantity += 1;
            this.totalAmount = this.totalAmount.add(this.unitPrice);
            BigDecimal taxPerUnit = this.unitPrice.multiply(this.taxRate.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
            this.totalTax = this.totalTax.add(taxPerUnit);
        }
    }

    public byte[] generateCheckInReceipt(Booking booking, String staffName) {
        long nights = computeNights(booking);
        List<Room> rooms = resolveRooms(booking);
        String displayRef = getDisplayReference(booking);

        List<LineItem> items = new ArrayList<>();
        BigDecimal totalRoomTariff = BigDecimal.ZERO;

        for (Room r : rooms) {
            BigDecimal rTotal = r.getPricePerNight().multiply(BigDecimal.valueOf(nights));
            items.add(new LineItem("Room " + r.getRoomNumber() + " (" + r.getRoomType() + ")", r.getPricePerNight(), String.valueOf(nights), new BigDecimal("18"), rTotal));
            totalRoomTariff = totalRoomTariff.add(rTotal);
        }

        List<Payment> payments = paymentRepository.findByBookingId(booking.getId());
        Payment initialPayment = payments.isEmpty() ? null : payments.get(0);

        Map<String, ServiceAggregator> serviceMap = new LinkedHashMap<>();
        if (booking.getSelectedExtraServices() != null) {
            for (ExtraService s : booking.getSelectedExtraServices()) {
                boolean isMidStay = s.getBookingId() != null || Boolean.FALSE.equals(s.getActive());
                if (!isMidStay && s.getPrice() != null) {
                    BigDecimal rate = s.getTaxRate() != null ? s.getTaxRate() : new BigDecimal("18");
                    String key = s.getName().trim().toLowerCase() + "_" + s.getPrice();
                    serviceMap.putIfAbsent(key, new ServiceAggregator(s.getName().trim(), s.getPrice(), rate));
                    serviceMap.get(key).add();
                }
            }
        }

        BigDecimal servicesBase = BigDecimal.ZERO;
        BigDecimal servicesTax = BigDecimal.ZERO;
        for (ServiceAggregator agg : serviceMap.values()) {
            items.add(new LineItem(agg.name, agg.unitPrice, String.valueOf(agg.quantity), agg.taxRate, agg.totalAmount));
            servicesBase = servicesBase.add(agg.totalAmount);
            servicesTax = servicesTax.add(agg.totalTax);
        }

        BigDecimal subtotal = totalRoomTariff.add(servicesBase);
        BigDecimal roomGst = totalRoomTariff.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalTax = roomGst.add(servicesTax).setScale(2, RoundingMode.HALF_UP);
        BigDecimal grossTotal = subtotal.add(totalTax);

        DiscountsResolved discounts = resolveDiscounts(booking);
        BigDecimal couponVal = discounts.couponDiscount;
        BigDecimal deskDiscountVal = discounts.deskDiscount;

        if (initialPayment != null) {
            if (initialPayment.getCouponDeducted() != null && initialPayment.getCouponDeducted().compareTo(BigDecimal.ZERO) > 0) {
                couponVal = initialPayment.getCouponDeducted();
            }
            if (initialPayment.getDiscountDeducted() != null && initialPayment.getDiscountDeducted().compareTo(BigDecimal.ZERO) > 0) {
                deskDiscountVal = initialPayment.getDiscountDeducted();
            }
        }

        BigDecimal netPayable = grossTotal.subtract(couponVal).subtract(deskDiscountVal).max(BigDecimal.ZERO);
        BigDecimal depositPaid = initialPayment != null && initialPayment.getAmountPaid() != null ? initialPayment.getAmountPaid() : booking.getAdvancePayment();
        BigDecimal balanceAtCheckIn = netPayable.subtract(depositPaid).max(BigDecimal.ZERO);

        String paymentMode = initialPayment != null && initialPayment.getPaymentMethod() != null
                ? initialPayment.getPaymentMethod().replace("_", " ").toUpperCase()
                : "CASH";

        InvoiceMeta meta = new InvoiceMeta(
                getGuestName(booking),
                getGuestPhone(booking),
                getGuestEmail(booking),
                getIdProof(booking),
                formatRoomsDisplay(rooms),
                String.valueOf(booking.getCheckInDate()),
                String.valueOf(booking.getCheckOutDate()),
                nights,
                displayRef,
                "INV-" + booking.getId() + "-CHECKIN",
                paymentMode,
                cleanStaffName(staffName, booking),
                discounts.deskDiscountReason
        );

        FinancialSummary finances = new FinancialSummary(
                subtotal, totalTax, grossTotal, couponVal, discounts.couponCode,
                deskDiscountVal, discounts.deskDiscountReason, netPayable, depositPaid, balanceAtCheckIn
        );

        return pdfBuilder.renderReceipt("CHECK-IN RECEIPT / DEPOSIT SLIP", meta, items, finances);
    }

    public byte[] generateMasterFolioPdf(Booking booking, String staffName) {
        long nights = computeNights(booking);
        List<Room> rooms = resolveRooms(booking);
        String displayRef = getDisplayReference(booking);

        List<LineItem> items = new ArrayList<>();
        BigDecimal totalRoomTariff = BigDecimal.ZERO;

        for (Room r : rooms) {
            BigDecimal rTotal = r.getPricePerNight().multiply(BigDecimal.valueOf(nights));
            items.add(new LineItem("Room " + r.getRoomNumber() + " (" + r.getRoomType() + ")", r.getPricePerNight(), String.valueOf(nights), new BigDecimal("18"), rTotal));
            totalRoomTariff = totalRoomTariff.add(rTotal);
        }

        Map<String, ServiceAggregator> serviceMap = new LinkedHashMap<>();
        if (booking.getSelectedExtraServices() != null) {
            for (ExtraService s : booking.getSelectedExtraServices()) {
                if (s.getPrice() != null) {
                    BigDecimal rate = s.getTaxRate() != null ? s.getTaxRate() : new BigDecimal("18.00");
                    String key = s.getName().trim().toLowerCase() + "_" + s.getPrice();
                    serviceMap.putIfAbsent(key, new ServiceAggregator(s.getName().trim(), s.getPrice(), rate));
                    serviceMap.get(key).add();
                }
            }
        }

        BigDecimal allServicesBase = BigDecimal.ZERO;
        BigDecimal allServicesTax = BigDecimal.ZERO;
        for (ServiceAggregator agg : serviceMap.values()) {
            items.add(new LineItem(agg.name, agg.unitPrice, String.valueOf(agg.quantity), agg.taxRate, agg.totalAmount));
            allServicesBase = allServicesBase.add(agg.totalAmount);
            allServicesTax = allServicesTax.add(agg.totalTax);
        }

        BigDecimal subtotal = totalRoomTariff.add(allServicesBase);
        BigDecimal roomGst = totalRoomTariff.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalTax = roomGst.add(allServicesTax).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalGross = subtotal.add(totalTax);

        DiscountsResolved discounts = resolveDiscounts(booking);
        BigDecimal netPayable = booking.getTotalAmount() != null ? booking.getTotalAmount() : totalGross.subtract(discounts.couponDiscount).subtract(discounts.deskDiscount).max(BigDecimal.ZERO);

        List<Payment> payments = paymentRepository.findByBookingId(booking.getId());
        BigDecimal totalPaid = BigDecimal.ZERO;
        for (Payment p : payments) {
            totalPaid = totalPaid.add(p.getAmountPaid() != null ? p.getAmountPaid() : p.getAmount());
        }

        BigDecimal balanceDue = booking.getBalanceDue() != null ? booking.getBalanceDue() : netPayable.subtract(totalPaid).max(BigDecimal.ZERO);

        InvoiceMeta meta = new InvoiceMeta(
                getGuestName(booking),
                getGuestPhone(booking),
                getGuestEmail(booking),
                getIdProof(booking),
                formatRoomsDisplay(rooms),
                String.valueOf(booking.getCheckInDate()),
                String.valueOf(booking.getCheckOutDate()),
                nights,
                displayRef,
                "INV-" + booking.getId() + "-MASTER",
                "SETTLED",
                cleanStaffName(staffName, booking),
                discounts.deskDiscountReason
        );

        FinancialSummary finances = new FinancialSummary(
                subtotal, totalTax, totalGross, discounts.couponDiscount, discounts.couponCode,
                discounts.deskDiscount, discounts.deskDiscountReason, netPayable, totalPaid, balanceDue
        );

        return pdfBuilder.renderReceipt("FINAL BILL / TAX INVOICE", meta, items, finances);
    }

    public byte[] generateRefundReceipt(Booking booking, Payment refundPayment, String staffName) {
        long nights = computeNights(booking);
        List<Room> rooms = resolveRooms(booking);
        String displayRef = getDisplayReference(booking);

        List<LineItem> items = new ArrayList<>();
        BigDecimal totalRoomTariff = BigDecimal.ZERO;

        // 1. Add Room itemized entry
        for (Room r : rooms) {
            BigDecimal rTotal = r.getPricePerNight().multiply(BigDecimal.valueOf(nights));
            items.add(new LineItem(
                    "Room " + r.getRoomNumber() + " (" + r.getRoomType() + ")",
                    r.getPricePerNight(),
                    String.valueOf(nights),
                    new BigDecimal("18"),
                    rTotal
            ));
            totalRoomTariff = totalRoomTariff.add(rTotal);
        }

        // 2. Add Extra Services (e.g., Airport Pickup) itemized entry
        Map<String, ServiceAggregator> serviceMap = new LinkedHashMap<>();
        if (booking != null && booking.getSelectedExtraServices() != null) {
            for (ExtraService s : booking.getSelectedExtraServices()) {
                if (s.getPrice() != null) {
                    BigDecimal rate = s.getTaxRate() != null ? s.getTaxRate() : new BigDecimal("18");
                    String key = s.getName().trim().toLowerCase() + "_" + s.getPrice();
                    serviceMap.putIfAbsent(key, new ServiceAggregator(s.getName().trim(), s.getPrice(), rate));
                    serviceMap.get(key).add();
                }
            }
        }

        BigDecimal servicesBase = BigDecimal.ZERO;
        BigDecimal servicesTax = BigDecimal.ZERO;
        for (ServiceAggregator agg : serviceMap.values()) {
            items.add(new LineItem(agg.name, agg.unitPrice, String.valueOf(agg.quantity), agg.taxRate, agg.totalAmount));
            servicesBase = servicesBase.add(agg.totalAmount);
            servicesTax = servicesTax.add(agg.totalTax);
        }

        // 3. Exact Subtotal and 18% GST match
        BigDecimal taxableSubtotal = totalRoomTariff.add(servicesBase);
        BigDecimal roomGst = totalRoomTariff.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalTax = roomGst.add(servicesTax).setScale(2, RoundingMode.HALF_UP);
        BigDecimal grossTotal = taxableSubtotal.add(totalTax);

        DiscountsResolved discounts = resolveDiscounts(booking);
        BigDecimal netPayable = grossTotal.subtract(discounts.couponDiscount).subtract(discounts.deskDiscount).max(BigDecimal.ZERO);

        // 4. Resolve refund amount & payment method
        BigDecimal refundAmt = netPayable;
        String refundMethod = "ORIGINAL PAYMENT SOURCE";

        if (refundPayment != null) {
            if (refundPayment.getAmountPaid() != null && refundPayment.getAmountPaid().compareTo(BigDecimal.ZERO) != 0) {
                refundAmt = refundPayment.getAmountPaid().abs();
            } else if (refundPayment.getAmount() != null && refundPayment.getAmount().compareTo(BigDecimal.ZERO) != 0) {
                refundAmt = refundPayment.getAmount().abs();
            }
            if (refundPayment.getPaymentMethod() != null && !refundPayment.getPaymentMethod().isBlank()) {
                refundMethod = refundPayment.getPaymentMethod().replace("_", " ").toUpperCase();
            }
        } else if (booking != null && booking.getAdvancePayment() != null && booking.getAdvancePayment().compareTo(BigDecimal.ZERO) > 0) {
            refundAmt = booking.getAdvancePayment();
        } else if (booking != null && booking.getTotalAmount() != null) {
            refundAmt = booking.getTotalAmount();
        }

        InvoiceMeta meta = new InvoiceMeta(
                getGuestName(booking),
                getGuestPhone(booking),
                getGuestEmail(booking),
                getIdProof(booking),
                formatRoomsDisplay(rooms),
                booking != null ? String.valueOf(booking.getCheckInDate()) : "-",
                booking != null ? String.valueOf(booking.getCheckOutDate()) : "-",
                nights,
                displayRef,
                "REFUND-" + (booking != null ? booking.getId() : ""),
                refundMethod,
                cleanStaffName(staffName, booking),
                "Cancellation Policy"
        );

        FinancialSummary finances = new FinancialSummary(
                taxableSubtotal,
                totalTax,
                grossTotal,
                discounts.couponDiscount,
                discounts.couponCode,
                discounts.deskDiscount,
                "Cancellation Refund",
                netPayable,
                refundAmt,
                BigDecimal.ZERO
        );

        return pdfBuilder.renderReceipt("CANCELLATION & REFUND ADVICE", meta, items, finances);
    }

    public byte[] generateExtraServiceReceipt(Booking booking, Long paymentId, String staffName) {
        if (paymentId == null) return generateCheckInReceipt(booking, staffName);
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment record not found: #" + paymentId));
        return generateReceiptByReceiptNumber(payment.getReceiptNumber(), staffName);
    }

    public byte[] generateReceiptByReceiptNumber(String receiptNumber, String staffName) {
        Payment payment = paymentRepository.findByReceiptNumber(receiptNumber)
                .orElseThrow(() -> new RuntimeException("Receipt not found: " + receiptNumber));
        Booking booking = payment.getBooking();
        long nights = computeNights(booking);
        List<Room> rooms = resolveRooms(booking);
        String displayRef = getDisplayReference(booking);

        BigDecimal gross = payment.getGrossAmount() != null ? payment.getGrossAmount() : payment.getAmount();
        BigDecimal taxEst = gross.multiply(new BigDecimal("0.18")).divide(new BigDecimal("1.18"), 2, RoundingMode.HALF_UP);
        BigDecimal taxable = gross.subtract(taxEst);

        List<LineItem> items = List.of(new LineItem(payment.getSettledItems() != null ? payment.getSettledItems() : "Payment", taxable, "1", new BigDecimal("18"), gross));

        InvoiceMeta meta = new InvoiceMeta(
                getGuestName(booking),
                getGuestPhone(booking),
                getGuestEmail(booking),
                getIdProof(booking),
                formatRoomsDisplay(rooms),
                String.valueOf(booking.getCheckInDate()),
                String.valueOf(booking.getCheckOutDate()),
                nights,
                displayRef,
                payment.getReceiptNumber(),
                payment.getPaymentMethod(),
                cleanStaffName(staffName, booking),
                null
        );

        FinancialSummary finances = new FinancialSummary(
                taxable, taxEst, gross, BigDecimal.ZERO, null, BigDecimal.ZERO, null,
                gross, payment.getAmount(), payment.getBalanceRemaining() != null ? payment.getBalanceRemaining() : BigDecimal.ZERO
        );

        return pdfBuilder.renderReceipt("SETTLEMENT RECEIPT SLIP", meta, items, finances);
    }


    public byte[] generateBookingPdf(Booking booking, String staffName) {
        long nights = computeNights(booking);
        List<Room> rooms = resolveRooms(booking);
        String displayRef = getDisplayReference(booking);

        List<LineItem> items = new ArrayList<>();
        BigDecimal totalRoomTariff = BigDecimal.ZERO;

        for (Room r : rooms) {
            BigDecimal rTotal = r.getPricePerNight().multiply(BigDecimal.valueOf(nights));
            items.add(new LineItem(
                    "Room " + r.getRoomNumber() + " (" + r.getRoomType() + ")",
                    r.getPricePerNight(),
                    String.valueOf(nights),
                    new BigDecimal("18"),
                    rTotal
            ));
            totalRoomTariff = totalRoomTariff.add(rTotal);
        }

        List<Payment> payments = paymentRepository.findByBookingId(booking.getId());
        Payment latestPayment = payments.isEmpty() ? null : payments.get(payments.size() - 1);

        Map<String, ServiceAggregator> serviceMap = new LinkedHashMap<>();
        if (booking.getSelectedExtraServices() != null) {
            for (ExtraService s : booking.getSelectedExtraServices()) {
                boolean isMidStay = s.getBookingId() != null || Boolean.FALSE.equals(s.getActive());
                if (!isMidStay && s.getPrice() != null) {
                    BigDecimal rate = s.getTaxRate() != null ? s.getTaxRate() : new BigDecimal("18");
                    String key = s.getName().trim().toLowerCase() + "_" + s.getPrice();
                    serviceMap.putIfAbsent(key, new ServiceAggregator(s.getName().trim(), s.getPrice(), rate));
                    serviceMap.get(key).add();
                }
            }
        }

        BigDecimal servicesBase = BigDecimal.ZERO;
        BigDecimal servicesTax = BigDecimal.ZERO;
        for (ServiceAggregator agg : serviceMap.values()) {
            items.add(new LineItem(agg.name, agg.unitPrice, String.valueOf(agg.quantity), agg.taxRate, agg.totalAmount));
            servicesBase = servicesBase.add(agg.totalAmount);
            servicesTax = servicesTax.add(agg.totalTax);
        }

        BigDecimal subtotal = totalRoomTariff.add(servicesBase);
        BigDecimal roomGst = totalRoomTariff.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalTax = roomGst.add(servicesTax).setScale(2, RoundingMode.HALF_UP);
        BigDecimal grossTotal = subtotal.add(totalTax);

        DiscountsResolved discounts = resolveDiscounts(booking);
        BigDecimal couponVal = discounts.couponDiscount;
        BigDecimal deskDiscountVal = discounts.deskDiscount;

        if (latestPayment != null) {
            if (latestPayment.getCouponDeducted() != null && latestPayment.getCouponDeducted().compareTo(BigDecimal.ZERO) > 0) {
                couponVal = latestPayment.getCouponDeducted();
            }
            if (latestPayment.getDiscountDeducted() != null && latestPayment.getDiscountDeducted().compareTo(BigDecimal.ZERO) > 0) {
                deskDiscountVal = latestPayment.getDiscountDeducted();
            }
        }

        BigDecimal netPayable = booking.getTotalAmount() != null
                ? booking.getTotalAmount()
                : grossTotal.subtract(couponVal).subtract(deskDiscountVal).max(BigDecimal.ZERO);

        BigDecimal paidAmount = latestPayment != null && latestPayment.getAmountPaid() != null
                ? latestPayment.getAmountPaid()
                : (booking.getAdvancePayment() != null ? booking.getAdvancePayment() : BigDecimal.ZERO);

        BigDecimal balanceDue = booking.getBalanceDue() != null
                ? booking.getBalanceDue()
                : netPayable.subtract(paidAmount).max(BigDecimal.ZERO);

        String paymentMode = latestPayment != null && latestPayment.getPaymentMethod() != null
                ? latestPayment.getPaymentMethod().replace("_", " ").toUpperCase()
                : "ONLINE";

        InvoiceMeta meta = new InvoiceMeta(
                getGuestName(booking),
                getGuestPhone(booking),
                getGuestEmail(booking),
                getIdProof(booking),
                formatRoomsDisplay(rooms),
                String.valueOf(booking.getCheckInDate()),
                String.valueOf(booking.getCheckOutDate()),
                nights,
                displayRef,
                "INV-" + booking.getId() + "-BOOKING",
                paymentMode,
                cleanStaffName(staffName, booking),
                discounts.deskDiscountReason
        );

        FinancialSummary finances = new FinancialSummary(
                subtotal, totalTax, grossTotal, couponVal, discounts.couponCode,
                deskDiscountVal, discounts.deskDiscountReason, netPayable, paidAmount, balanceDue
        );

        return pdfBuilder.renderReceipt("BOOKING CONFIRMATION & PAYMENT RECEIPT", meta, items, finances);
    }

    private String getDisplayReference(Booking booking) {
        if (booking == null) return "N/A";
        if (booking.getBookingReference() != null && !booking.getBookingReference().isBlank()) {
            return booking.getBookingReference();
        }
        return "#" + booking.getId();
    }

    private List<Room> resolveRooms(Booking b) {
        if (b == null) return List.of();
        if (b.getRooms() != null && !b.getRooms().isEmpty()) return b.getRooms();
        if (b.getRoom() != null) return List.of(b.getRoom());
        return List.of();
    }

    private String formatRoomsDisplay(List<Room> rooms) {
        if (rooms.isEmpty()) return "—";
        return rooms.stream().map(r -> "Room " + r.getRoomNumber() + " (" + r.getRoomType() + ")").collect(Collectors.joining(", "));
    }

    private static class DiscountsResolved {
        BigDecimal couponDiscount = BigDecimal.ZERO;
        String couponCode;
        BigDecimal deskDiscount = BigDecimal.ZERO;
        String deskDiscountReason;
    }

    private DiscountsResolved resolveDiscounts(Booking booking) {
        DiscountsResolved res = new DiscountsResolved();
        if (booking == null || booking.getId() == null) return res;

        List<BookingDiscount> discounts = bookingDiscountRepository.findByBookingId(booking.getId());
        for (BookingDiscount d : discounts) {
            BigDecimal amt = d.getCalculatedAmount() != null ? d.getCalculatedAmount() : BigDecimal.ZERO;
            if ("COUPON".equalsIgnoreCase(d.getDiscountSource())) {
                res.couponDiscount = res.couponDiscount.add(amt);
                res.couponCode = booking.getCouponCode();
            } else if ("DESK_CONCESSION".equalsIgnoreCase(d.getDiscountSource())) {
                res.deskDiscount = res.deskDiscount.add(amt);
                res.deskDiscountReason = d.getReason();
            }
        }
        return res;
    }

    private String cleanStaffName(String staffName, Booking booking) {
        if (staffName == null || staffName.isBlank() || "ONLINE".equalsIgnoreCase(staffName.trim())) {
            return null;
        }

        if (staffName.contains("@")) {
            if (booking != null && booking.getReceptionist() != null) {
                String recName = ((booking.getReceptionist().getFirstName() != null ? booking.getReceptionist().getFirstName() : "")
                        + " "
                        + (booking.getReceptionist().getLastName() != null ? booking.getReceptionist().getLastName() : "")).trim();
                if (!recName.isBlank()) return recName;
            }
            return null;
        }

        return staffName.trim();
    }

    private long computeNights(Booking b) {
        if (b != null && b.getCheckInDate() != null && b.getCheckOutDate() != null) {
            return Math.max(1, ChronoUnit.DAYS.between(b.getCheckInDate(), b.getCheckOutDate()));
        }
        return 1;
    }

    private String getGuestName(Booking b) {
        return (b != null && b.getGuest() != null) ? (b.getGuest().getFirstName() + " " + b.getGuest().getLastName()).trim() : "Guest";
    }

    private String getGuestPhone(Booking b) {
        return (b != null && b.getGuest() != null) ? b.getGuest().getPhone() : "-";
    }

    private String getGuestEmail(Booking b) {
        return (b != null && b.getGuest() != null) ? b.getGuest().getEmail() : "-";
    }

    private String getIdProof(Booking b) {
        return (b != null && b.getGuest() != null && b.getGuest().getIdProofType() != null) ? b.getGuest().getIdProofType().name() : "-";
    }
}