package com.athenura.hotel_management_system.payment.service.impl;

import com.athenura.hotel_management_system.booking.entity.Booking;
import com.athenura.hotel_management_system.booking.repository.BookingRepository;
import com.athenura.hotel_management_system.booking.service.MasterReceiptPdfService;
import com.athenura.hotel_management_system.notification.service.EmailService;
import com.athenura.hotel_management_system.payment.dto.PaymentDTO;
import com.athenura.hotel_management_system.payment.entity.Payment;
import com.athenura.hotel_management_system.payment.mapper.PaymentMapper;
import com.athenura.hotel_management_system.payment.repository.PaymentRepository;
import com.athenura.hotel_management_system.payment.service.PaymentService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Refund;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final PaymentMapper paymentMapper;
    private final EmailService emailNotificationService;
    private final MasterReceiptPdfService masterReceiptPdfService;

    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");

    private BigDecimal calculateDefaultAmount(String paymentType, BigDecimal totalAmount, BigDecimal alreadyPaid) {
        BigDecimal remainingBalance = totalAmount.subtract(alreadyPaid).max(BigDecimal.ZERO);

        if ("SPLIT_ADVANCE".equalsIgnoreCase(paymentType)) {
            return totalAmount.multiply(new BigDecimal("0.40")).setScale(2, RoundingMode.HALF_UP);
        } else if ("SPLIT_BALANCE".equalsIgnoreCase(paymentType) || "FULL".equalsIgnoreCase(paymentType)) {
            return remainingBalance;
        } else {
            return remainingBalance;
        }
    }

    @Override
    @Transactional
    public PaymentDTO.ReceiptResponse processPayment(PaymentDTO.PaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found!"));

        BigDecimal totalAmount = booking.getTotalAmount() != null ? booking.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal alreadyPaid = paymentRepository.sumPaidByBookingId(booking.getId());
        if (alreadyPaid == null) {
            alreadyPaid = BigDecimal.ZERO;
        }
        BigDecimal currentBalance = totalAmount.subtract(alreadyPaid);

        if (currentBalance.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("No Pending Balance to pay for this booking!");
        }

        BigDecimal amountToPay;
        if (request.getAmount() != null && request.getAmount().compareTo(BigDecimal.ZERO) > 0) {
            amountToPay = request.getAmount();
        } else {
            amountToPay = calculateDefaultAmount(request.getPaymentType(), totalAmount, alreadyPaid);
        }

        if (amountToPay.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Payment must be greater than 0");
        }

        if (amountToPay.compareTo(currentBalance) > 0) {
            throw new RuntimeException("Amount cannot exceed the remaining balance: " + currentBalance);
        }

        String paymentMethod = request.getPaymentMethod() != null ? request.getPaymentMethod().toUpperCase() : "CASH";

        if ("CARD_MACHINE".equals(paymentMethod)) {
            if (request.getTransactionReference() == null || request.getTransactionReference().trim().isEmpty()) {
                throw new IllegalArgumentException("Card Machine Auth/Slip Reference is required for card payments.");
            }
        }

        String finalReceiptNumber = (request.getReceiptNumber() != null && !request.getReceiptNumber().trim().isEmpty())
                ? request.getReceiptNumber().trim()
                : "REC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        BigDecimal totalPaidSoFar = alreadyPaid.add(amountToPay);
        BigDecimal newRemainingBalance = totalAmount.subtract(totalPaidSoFar).max(BigDecimal.ZERO);

        BigDecimal resolvedGross = request.getGrossAmount() != null ? request.getGrossAmount() : amountToPay;
        BigDecimal resolvedCoupon = request.getCouponDeducted() != null ? request.getCouponDeducted() : BigDecimal.ZERO;
        BigDecimal resolvedDiscount = request.getDiscountDeducted() != null ? request.getDiscountDeducted() : BigDecimal.ZERO;
        BigDecimal resolvedBalanceAfterSlip = request.getBalanceRemaining() != null ? request.getBalanceRemaining() : newRemainingBalance;

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(amountToPay)
                .amountPaid(amountToPay)
                .paymentType(request.getPaymentType() != null ? request.getPaymentType().toUpperCase() : "PARTIAL")
                .paymentMethod(paymentMethod)
                .transactionReference("CARD_MACHINE".equals(paymentMethod) ? request.getTransactionReference().trim().toUpperCase() : null)
                .paymentStatus("SUCCESS")
                .receiptNumber(finalReceiptNumber)
                .settledItems(request.getSettledItems())
                .paymentDate(LocalDateTime.now(IST_ZONE))
                .grossAmount(resolvedGross)
                .couponDeducted(resolvedCoupon)
                .discountDeducted(resolvedDiscount)
                .balanceRemaining(resolvedBalanceAfterSlip)
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        booking.setBalanceDue(newRemainingBalance);
        bookingRepository.save(booking);

        String receiptType = (resolvedBalanceAfterSlip.compareTo(BigDecimal.ZERO) <= 0)
                ? "FULL_PAYMENT_RECEIPT"
                : "ADVANCE_PAYMENT_RECEIPT";

        return paymentMapper.toReceiptResponse(
                savedPayment,
                booking,
                totalPaidSoFar,
                resolvedBalanceAfterSlip,
                receiptType
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentDTO.ReceiptResponse getReceiptByNumber(String receiptNumber) {
        Payment payment = paymentRepository.findByReceiptNumber(receiptNumber)
                .orElseThrow(() -> new RuntimeException("Receipt not found: " + receiptNumber));

        Booking booking = payment.getBooking();
        BigDecimal totalPaidSoFar = paymentRepository.sumPaidByBookingId(booking.getId());
        if (totalPaidSoFar == null) totalPaidSoFar = BigDecimal.ZERO;

        BigDecimal balanceAfterThisSlip = payment.getBalanceRemaining() != null
                ? payment.getBalanceRemaining()
                : (booking.getTotalAmount() != null ? booking.getTotalAmount().subtract(totalPaidSoFar).max(BigDecimal.ZERO) : BigDecimal.ZERO);

        String receiptType = (balanceAfterThisSlip.compareTo(BigDecimal.ZERO) <= 0)
                ? "FULL_PAYMENT_RECEIPT"
                : "ADVANCE_PAYMENT_RECEIPT";

        return paymentMapper.toReceiptResponse(
                payment,
                booking,
                totalPaidSoFar,
                balanceAfterThisSlip,
                receiptType
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentDTO.ReceiptResponse> getPaymentsByBookingId(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        BigDecimal totalPaidSoFar = paymentRepository.sumPaidByBookingId(booking.getId());
        if (totalPaidSoFar == null) totalPaidSoFar = BigDecimal.ZERO;

        BigDecimal finalTotalPaidSoFar = totalPaidSoFar;
        return paymentRepository.findByBookingId(bookingId)
                .stream()
                .map(p -> {
                    BigDecimal balanceAfterThisSlip = p.getBalanceRemaining() != null
                            ? p.getBalanceRemaining()
                            : (booking.getTotalAmount() != null ? booking.getTotalAmount().subtract(finalTotalPaidSoFar).max(BigDecimal.ZERO) : BigDecimal.ZERO);

                    String receiptType = (balanceAfterThisSlip.compareTo(BigDecimal.ZERO) <= 0)
                            ? "FULL_PAYMENT_RECEIPT"
                            : "ADVANCE_PAYMENT_RECEIPT";

                    return paymentMapper.toReceiptResponse(
                            p,
                            booking,
                            finalTotalPaidSoFar,
                            balanceAfterThisSlip,
                            receiptType
                    );
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentDTO.ReceiptResponse> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(payment -> {
                    Booking booking = payment.getBooking();
                    BigDecimal balanceAfterThisSlip = payment.getBalanceRemaining() != null
                            ? payment.getBalanceRemaining()
                            : BigDecimal.ZERO;

                    BigDecimal slipPaid = payment.getAmountPaid() != null ? payment.getAmountPaid() : payment.getAmount();

                    String receiptType = (balanceAfterThisSlip.compareTo(BigDecimal.ZERO) <= 0)
                            ? "FULL_PAYMENT_RECEIPT"
                            : "ADVANCE_PAYMENT_RECEIPT";

                    return paymentMapper.toReceiptResponse(
                            payment,
                            booking,
                            slipPaid,
                            balanceAfterThisSlip,
                            receiptType
                    );
                })
                .toList();
    }

    @Override
    @Transactional
    public PaymentDTO.RazorpayOrderResponse createRazorpayOrder(Long bookingId, String paymentType) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found!"));

        BigDecimal totalAmount = booking.getTotalAmount() != null ? booking.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal alreadyPaid = paymentRepository.sumPaidByBookingId(booking.getId());
        if (alreadyPaid == null) alreadyPaid = BigDecimal.ZERO;

        BigDecimal amountToPay = calculateDefaultAmount(paymentType, totalAmount, alreadyPaid);

        if (amountToPay.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("No Pending Balance to pay for this booking!");
        }

        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountToPay.multiply(new BigDecimal("100")).setScale(0, RoundingMode.HALF_UP).intValue());
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "bk_" + bookingId);

            Order order = client.orders.create(orderRequest);

            return PaymentDTO.RazorpayOrderResponse.builder()
                    .orderId(order.get("id"))
                    .amount(amountToPay)
                    .currency("INR")
                    .keyId(razorpayKeyId)
                    .bookingId(bookingId)
                    .paymentType(paymentType)
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Error creating Razorpay order: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public PaymentDTO.ReceiptResponse verifyRazorpayPayment(PaymentDTO.RazorpayVerifyRequest request) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", request.getRazorpayOrderId());
            options.put("razorpay_payment_id", request.getRazorpayPaymentId());
            options.put("razorpay_signature", request.getRazorpaySignature());

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);
            if (!isValid) {
                throw new RuntimeException("Invalid Signature! Payment verification failed.");
            }

            Booking booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new RuntimeException("Booking not found!"));

            BigDecimal totalAmount = booking.getTotalAmount() != null ? booking.getTotalAmount() : BigDecimal.ZERO;
            BigDecimal alreadyPaid = paymentRepository.sumPaidByBookingId(booking.getId());
            if (alreadyPaid == null) alreadyPaid = BigDecimal.ZERO;

            BigDecimal amountToPay = calculateDefaultAmount(request.getPaymentType(), totalAmount, alreadyPaid);

            BigDecimal totalPaidSoFar = alreadyPaid.add(amountToPay);
            BigDecimal remainingBalance = totalAmount.subtract(totalPaidSoFar).max(BigDecimal.ZERO);

            BigDecimal trueBookingGross = (booking.getSubtotal() != null ? booking.getSubtotal() : BigDecimal.ZERO)
                    .add(booking.getTaxAmount() != null ? booking.getTaxAmount() : BigDecimal.ZERO);

            Payment payment = Payment.builder()
                    .booking(booking)
                    .amount(amountToPay)
                    .amountPaid(amountToPay)
                    .paymentType(request.getPaymentType().toUpperCase())
                    .paymentMethod("RAZORPAY_ONLINE")
                    .paymentStatus("SUCCESS")
                    .receiptNumber("REC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .paymentDate(LocalDateTime.now(IST_ZONE))
                    .razorpayOrderId(request.getRazorpayOrderId())
                    .razorpayPaymentId(request.getRazorpayPaymentId())
                    .transactionReference(request.getRazorpayPaymentId())
                    .settledItems("Online Gateway Payment (" + request.getPaymentType().toUpperCase() + ")")
                    .grossAmount(trueBookingGross.compareTo(BigDecimal.ZERO) > 0 ? trueBookingGross : amountToPay)
                    .couponDeducted(BigDecimal.ZERO)
                    .discountDeducted(BigDecimal.ZERO)
                    .balanceRemaining(remainingBalance)
                    .build();

            Payment savedPayment = paymentRepository.save(payment);

            booking.setBalanceDue(remainingBalance);
            bookingRepository.save(booking);

            try {
                emailNotificationService.sendOnlineBookingWithPaymentSummary(booking, savedPayment);
            } catch (Exception mailEx) {
                log.warn("Failed to dispatch unified booking confirmation email: {}", mailEx.getMessage());
            }

            String receiptType = (remainingBalance.compareTo(BigDecimal.ZERO) <= 0)
                    ? "FULL_PAYMENT_RECEIPT"
                    : "ADVANCE_PAYMENT_RECEIPT";

            return paymentMapper.toReceiptResponse(
                    savedPayment,
                    booking,
                    totalPaidSoFar,
                    remainingBalance,
                    receiptType
            );

        } catch (Exception e) {
            throw new RuntimeException("Razorpay Verification Error: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void processRefundForBooking(Long bookingId) {
        processRefundForBookingWithPolicy(bookingId, BigDecimal.ONE);
    }

    @Override
    @Transactional
    public void processRefundForBookingWithPolicy(Long bookingId, BigDecimal refundRatio) {
        List<Payment> payments = paymentRepository.findByBookingId(bookingId);

        for (Payment payment : payments) {
            if (!"SUCCESS".equalsIgnoreCase(payment.getPaymentStatus())) {
                continue;
            }

            BigDecimal originalPaid = payment.getAmountPaid() != null && payment.getAmountPaid().compareTo(BigDecimal.ZERO) > 0
                    ? payment.getAmountPaid()
                    : (payment.getAmount() != null ? payment.getAmount() : BigDecimal.ZERO);

            if (originalPaid.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            BigDecimal safeRatio = (refundRatio != null) ? refundRatio : BigDecimal.ONE;
            BigDecimal refundAmount = originalPaid.multiply(safeRatio).setScale(2, RoundingMode.HALF_UP);

            if (payment.getRazorpayPaymentId() != null && !payment.getRazorpayPaymentId().isBlank()) {
                try {
                    if (refundAmount.compareTo(BigDecimal.ZERO) > 0) {
                        RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
                        JSONObject refundRequest = new JSONObject();
                        int amountInPaise = refundAmount.multiply(new BigDecimal("100")).intValue();
                        refundRequest.put("amount", amountInPaise);
                        refundRequest.put("speed", "normal");

                        JSONObject notes = new JSONObject();
                        notes.put("bookingId", String.valueOf(bookingId));
                        refundRequest.put("notes", notes);

                        Refund refund = client.payments.refund(payment.getRazorpayPaymentId(), refundRequest);
                        String refundId = refund.has("id") ? refund.get("id").toString() : "RAZORPAY_REFUND";

                        payment.setPaymentStatus("REFUNDED");
                        payment.setTransactionReference("REFUND-" + refundId);
                        Payment savedRefundPayment = paymentRepository.save(payment);

                        try {
                            byte[] refundPdf = masterReceiptPdfService.generateRefundReceipt(
                                    payment.getBooking(),
                                    savedRefundPayment,
                                    "Accounts Desk"
                            );
                            emailNotificationService.sendRefundNotificationWithPdf(
                                    payment.getBooking(),
                                    refundAmount,
                                    refundId,
                                    refundPdf
                            );
                        } catch (Exception mailEx) {
                            log.warn("Failed to generate or dispatch refund PDF email: {}", mailEx.getMessage());
                        }
                    } else {
                        payment.setPaymentStatus("RETAINED_NO_REFUND");
                        paymentRepository.save(payment);
                    }
                } catch (Exception e) {
                    throw new RuntimeException("Failed to reverse Razorpay payment "
                            + payment.getRazorpayPaymentId() + ": " + e.getMessage(), e);
                }
            }

            else if ("CARD_MACHINE".equalsIgnoreCase(payment.getPaymentMethod())) {
                payment.setPaymentStatus("REFUNDED");
                String origAuth = payment.getTransactionReference() != null ? payment.getTransactionReference() : "NONE";
                String refundRef = "POS-REVERSED-" + origAuth;
                payment.setTransactionReference(refundRef);
                Payment savedRefundPayment = paymentRepository.save(payment);

                if (refundAmount.compareTo(BigDecimal.ZERO) > 0) {
                    try {
                        byte[] refundPdf = masterReceiptPdfService.generateRefundReceipt(
                                payment.getBooking(),
                                savedRefundPayment,
                                "Front Desk"
                        );
                        emailNotificationService.sendRefundNotificationWithPdf(
                                payment.getBooking(),
                                refundAmount,
                                refundRef,
                                refundPdf
                        );
                    } catch (Exception mailEx) {
                        log.warn("Failed to send POS refund email: {}", mailEx.getMessage());
                    }
                }
            }

            else {
                payment.setPaymentStatus("REFUNDED");
                payment.setTransactionReference("CASH-REFUNDED-BOOKING-" + bookingId);
                paymentRepository.save(payment);

                if (refundAmount.compareTo(BigDecimal.ZERO) > 0) {
                    String cashReceiptNum = "REF-CASH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                    Payment cashPayout = Payment.builder()
                            .booking(payment.getBooking())
                            .amount(refundAmount.negate())
                            .amountPaid(refundAmount.negate())
                            .taxableAmount(BigDecimal.ZERO)
                            .taxAmount(BigDecimal.ZERO)
                            .totalAmount(refundAmount.negate())
                            .balanceDue(BigDecimal.ZERO)
                            .paymentType("CASH_REFUND_OUTFLOW")
                            .paymentMethod("CASH")
                            .paymentStatus("REFUNDED")
                            .receiptNumber(cashReceiptNum)
                            .paymentDate(LocalDateTime.now(IST_ZONE))
                            .transactionReference("CASH-PAYOUT-BK" + bookingId)
                            .settledItems("Cash refund payout for cancelled booking #" + bookingId)
                            .grossAmount(refundAmount.negate())
                            .discountDeducted(BigDecimal.ZERO)
                            .couponDeducted(BigDecimal.ZERO)
                            .balanceRemaining(BigDecimal.ZERO)
                            .build();

                    Payment savedCashPayout = paymentRepository.save(cashPayout);

                    try {
                        byte[] refundPdf = masterReceiptPdfService.generateRefundReceipt(
                                payment.getBooking(),
                                savedCashPayout,
                                "Cashier Desk"
                        );
                        emailNotificationService.sendRefundNotificationWithPdf(
                                payment.getBooking(),
                                refundAmount,
                                cashReceiptNum,
                                refundPdf
                        );
                    } catch (Exception mailEx) {
                        log.warn("Failed to send cash refund email: {}", mailEx.getMessage());
                    }
                }
            }
        }
    }
}