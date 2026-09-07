package com.athenura.hotel_management_system.payment.service.impl;

import com.athenura.hotel_management_system.booking.entity.Booking;
import com.athenura.hotel_management_system.booking.repository.BookingRepository;
import com.athenura.hotel_management_system.payment.dto.PaymentDTO;
import com.athenura.hotel_management_system.payment.entity.Payment;
import com.athenura.hotel_management_system.payment.mapper.PaymentMapper;
import com.athenura.hotel_management_system.payment.repository.PaymentRepository;
import com.athenura.hotel_management_system.payment.service.PaymentService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import com.razorpay.Utils;

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


    // this calculates the default calculation for split payments
    private BigDecimal calculateDefaultAmount(String paymentType, BigDecimal totalAmount, BigDecimal alreadyPaid) {
        BigDecimal remainingBalance = totalAmount.subtract(alreadyPaid);

        if ("SPLIT_ADVANCE".equalsIgnoreCase(paymentType)) {
            return BigDecimal.valueOf(totalAmount.doubleValue() * 0.40);
        } else if ("SPLIT_BALANCE".equalsIgnoreCase(paymentType) || "FULL".equalsIgnoreCase(paymentType)) {
            return remainingBalance;
        } else {
            return remainingBalance;
        }
    }



    // reception payment
    @Override
    @Transactional
    public PaymentDTO.ReceiptResponse processPayment(PaymentDTO.PaymentRequest request) {
        //find the booking
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(()-> new RuntimeException("Booking not found!"));

        // fecth total and previous payments
        BigDecimal totalAmount = booking.getTotalAmount();
        BigDecimal alreadyPaid = paymentRepository.sumPaidByBookingId(booking.getId());
        BigDecimal currentBalance = totalAmount.subtract(alreadyPaid);


        // check if the balance is not zero
        if (currentBalance.compareTo(BigDecimal.ZERO) <= 0){
            throw new RuntimeException("No Pending Balance to pay for this booking.!");
        }

        BigDecimal amountToPay;

        if(request.getAmount() !=null && request.getAmount().compareTo(BigDecimal.ZERO) >0){
            amountToPay = request.getAmount();
        }else {
            amountToPay = calculateDefaultAmount(request.getPaymentType(), totalAmount,alreadyPaid);
        }

        if(amountToPay.compareTo(BigDecimal.ZERO) <=0){
            throw new RuntimeException("Payment Must be greater than 0");
        }

        if(amountToPay.compareTo(currentBalance) > 0){
            throw new RuntimeException("Amount can not exceed the remaining balance: " + currentBalance);
        }

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(amountToPay)
                .paymentType(request.getPaymentType() != null ? request.getPaymentType().toUpperCase() : "PARTIAL")
                .paymentMethod(request.getPaymentMethod().toUpperCase())
                .paymentStatus("SUCCESS")
                .receiptNumber("REC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .paymentDate(LocalDateTime.now())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        //calculate the balance
        BigDecimal totalPaidSoFar = alreadyPaid.add(amountToPay);
        BigDecimal remainingBalance = totalAmount.subtract(totalPaidSoFar);


        //receipt check (if less than equal to zero then full receipt else advance receipt)
        String receiptType;
        if(remainingBalance.compareTo(BigDecimal.ZERO) <=0){
            receiptType = "FULL_PAYMENT_RECEIPT";
        }else {
            receiptType = "ADVANCE_PAYMENT_RECEIPT";
        }

        return paymentMapper.toReceiptResponse(
                savedPayment,
                booking,
                totalPaidSoFar,
                remainingBalance,
                receiptType
        );
    }

    @Override
    public PaymentDTO.ReceiptResponse getReceiptByNumber(String receiptNumber) {
        //find receipt
        Payment payment = paymentRepository.findByReceiptNumber(receiptNumber)
                .orElseThrow(() -> new RuntimeException("Receipt not found: "+ receiptNumber));

        Booking booking = payment.getBooking();
        BigDecimal totalPaidSoFar = paymentRepository.sumPaidByBookingId(booking.getId());
        BigDecimal remainingBalance = booking.getTotalAmount().subtract(totalPaidSoFar);

        //receipt type
        String receiptType;
        if (remainingBalance.compareTo(BigDecimal.ZERO) <= 0) {
            receiptType = "FULL_PAYMENT_RECEIPT";
        } else {
            receiptType = "ADVANCE_PAYMENT_RECEIPT";
        }

      // receipt response
        return paymentMapper.toReceiptResponse(
                payment,
                booking,
                totalPaidSoFar,
                remainingBalance,
                receiptType
        );
    }

    @Override
    public List<PaymentDTO.ReceiptResponse> getPaymentsByBookingId(Long bookingId) {

        //find booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(()-> new RuntimeException("Booking not found: " + bookingId));

        //find total and remaining balance
        BigDecimal totalPaidSoFar = paymentRepository.sumPaidByBookingId(booking.getId());
        BigDecimal remainingBalance = booking.getTotalAmount().subtract(totalPaidSoFar);

        String receiptType;
        if (remainingBalance.compareTo(BigDecimal.ZERO) <= 0) {
            receiptType = "FULL_PAYMENT_RECEIPT";
        } else {
            receiptType = "ADVANCE_PAYMENT_RECEIPT";
        }

        //stream and map each payment
        return paymentRepository.findByBookingId(bookingId)
                .stream()
                .map(p -> paymentMapper.toReceiptResponse(
                        p,
                        booking,
                        totalPaidSoFar,
                        remainingBalance,
                        receiptType))

                .toList();




    }

    @Override
    public PaymentDTO.RazorpayOrderResponse createRazorpayOrder(Long bookingId, String paymentType) {
        // find the booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found!"));

        // fetch total and previous payments
        BigDecimal totalAmount = booking.getTotalAmount();
        BigDecimal alreadyPaid = paymentRepository.sumPaidByBookingId(booking.getId());
        BigDecimal amountToPay = calculateDefaultAmount(paymentType, totalAmount, alreadyPaid);

        if (amountToPay.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("No Pending Balance to pay for this booking!");
        }

        try {
            //connect to razorpay client
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            // Razorpay by default is in paise
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", (int) (amountToPay.doubleValue() * 100)); //in paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "bk_" + bookingId);

            // razorpay generates and returns an Order object
            Order order = client.orders.create(orderRequest);

            // return response to frontend
            return PaymentDTO.RazorpayOrderResponse.builder()
                    .orderId(order.get("id"))
                    .amount(amountToPay)
                    .currency("INR")
                    .keyId(razorpayKeyId)
                    .bookingId(bookingId)
                    .paymentType(paymentType)
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Error creating Razorpay order: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public PaymentDTO.ReceiptResponse verifyRazorpayPayment(PaymentDTO.RazorpayVerifyRequest request) {
        try {
            // check cryptographic signature to confirm Razorpay actually processed the money
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", request.getRazorpayOrderId());
            options.put("razorpay_payment_id", request.getRazorpayPaymentId());
            options.put("razorpay_signature", request.getRazorpaySignature());

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);
            if (!isValid) {
                throw new RuntimeException("Invalid Signature! Payment verification failed.");
            }

            // find the booking
            Booking booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new RuntimeException("Booking not found!"));

            // fetch total and previous payments
            BigDecimal totalAmount = booking.getTotalAmount();
            BigDecimal alreadyPaid = paymentRepository.sumPaidByBookingId(booking.getId());
            BigDecimal amountToPay = calculateDefaultAmount(request.getPaymentType(), totalAmount, alreadyPaid);

            // build and save the payment
            Payment payment = Payment.builder()
                    .booking(booking)
                    .amount(amountToPay)
                    .paymentType(request.getPaymentType().toUpperCase())
                    .paymentMethod("RAZORPAY")
                    .paymentStatus("SUCCESS")
                    .receiptNumber("REC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .paymentDate(LocalDateTime.now())
                    .razorpayOrderId(request.getRazorpayOrderId())
                    .razorpayPaymentId(request.getRazorpayPaymentId())
                    .build();

            Payment savedPayment = paymentRepository.save(payment);

            // calculate remaining balance
            BigDecimal totalPaidSoFar = alreadyPaid.add(amountToPay);
            BigDecimal remainingBalance = totalAmount.subtract(totalPaidSoFar);

            // determine receipt type
            String receiptType;
            if (remainingBalance.compareTo(BigDecimal.ZERO) <= 0) {
                receiptType = "FULL_PAYMENT_RECEIPT";
            } else {
                receiptType = "ADVANCE_PAYMENT_RECEIPT";
            }

            // return receipt response
            return paymentMapper.toReceiptResponse(
                    savedPayment,
                    booking,
                    totalPaidSoFar,
                    remainingBalance,
                    receiptType
            );

        } catch (Exception e) {
            throw new RuntimeException("Razorpay Verification Error: " + e.getMessage());
        }
    }


}
