package com.athenura.hotel_management_system.payment.controller;

import com.athenura.hotel_management_system.booking.service.MasterReceiptPdfService;
import com.athenura.hotel_management_system.payment.dto.PaymentDTO;
import com.athenura.hotel_management_system.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;
    private final MasterReceiptPdfService masterReceiptPdfService;

    @GetMapping
    public ResponseEntity<List<PaymentDTO.ReceiptResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @PostMapping("/pay")
    public ResponseEntity<PaymentDTO.ReceiptResponse> makePayment(
            @RequestBody PaymentDTO.PaymentRequest request) {
        return ResponseEntity.ok(paymentService.processPayment(request));
    }

    @GetMapping("/receipt/{receiptNumber}")
    public ResponseEntity<PaymentDTO.ReceiptResponse> getReceipt(
            @PathVariable String receiptNumber) {
        return ResponseEntity.ok(paymentService.getReceiptByNumber(receiptNumber));
    }

    @GetMapping("/receipt/{receiptNumber}/pdf")
    public ResponseEntity<byte[]> getReceiptPdf(
            @PathVariable String receiptNumber,
            @RequestParam(required = false) String preparedBy,
            Principal principal) {
        String staff = preparedBy != null && !preparedBy.isBlank() ? preparedBy : (principal != null ? principal.getName() : null);
        byte[] pdf = masterReceiptPdfService.generateReceiptByReceiptNumber(receiptNumber, staff);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + receiptNumber + ".pdf\"")
                .body(pdf);
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<PaymentDTO.ReceiptResponse>> getPaymentsByBookId(
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentsByBookingId(bookingId));
    }

    @PostMapping("/razorpay/order")
    public ResponseEntity<PaymentDTO.RazorpayOrderResponse> createRazorpayOrder(
            @RequestParam Long bookingId,
            @RequestParam(defaultValue = "FULL") String paymentType) {
        return ResponseEntity.ok(paymentService.createRazorpayOrder(bookingId, paymentType));
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<PaymentDTO.ReceiptResponse> verifyRazorpayPayment(
            @RequestBody PaymentDTO.RazorpayVerifyRequest request) {
        return ResponseEntity.ok(paymentService.verifyRazorpayPayment(request));
    }
}