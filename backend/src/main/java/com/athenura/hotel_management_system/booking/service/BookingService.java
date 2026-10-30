package com.athenura.hotel_management_system.booking.service;

import com.athenura.hotel_management_system.booking.dto.*;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface BookingService {

    BookingResponse createBooking(BookingRequest request);
    BookingResponse createBooking(BookingRequest request, String staffEmail);

    BookingResponse updateBooking(Long id, BookingRequest request);

    BookingResponse getBookingById(Long id);

    List<BookingResponse> getAllBookings();

    String cancelBooking(Long id);

    List<BookingDiscountResponse> getBookingDiscounts(Long bookingId);

    BookingResponse checkInGuest(Long bookingId);
    BookingResponse checkInGuest(Long bookingId, String staffEmail);

    BookingResponse checkOutGuest(Long bookingId);

    BookingResponse addExtraServicesToBooking(Long bookingId, List<Long> extraServiceIds);

    BookingResponse addCustomServiceToBooking(Long bookingId, CustomServiceRequest request);

    BookingResponse removeExtraServiceFromBooking(Long bookingId, Long extraServiceId);

    BookingSettlementResponse getSettlementBreakdown(Long bookingId);

    BookingResponse applyPostBookingDiscount(Long bookingId, BigDecimal discountValue, String discountType, String reason);

    BookingResponse settlePartialServicePayment(Long bookingId, List<Long> serviceIdsToPay, BigDecimal paymentAmount, String paymentMethod);

    BookingResponse settlePartialServicePayment(Long bookingId, List<Long> serviceIdsToPay, BigDecimal paymentAmount, String paymentMethod, BigDecimal discountAmount, String discountReason);

    BookingResponse extendStay(Long bookingId, LocalDate newCheckOutDate);

    BookingResponse switchRoom(Long bookingId, Long targetRoomId, String reason);

    @Transactional
    BookingResponse switchRoom(Long bookingId, Long targetRoomId, String reason, Long sourceRoomId);

    List<BookingResponse> getBookingsByGuestId(Long guestId);

    byte[] generateCheckInSlipPdf(Long bookingId, String preparedBy, String userEmail);

    byte[] generateServiceSlipPdf(Long bookingId, String preparedBy, String userEmail);

    byte[] generateMasterFolioPdf(Long bookingId, String preparedBy, String userEmail);

    byte[] generatePaymentSlipPdf(Long bookingId, Long paymentId, String preparedBy, String userEmail);

    byte[] generateReceiptByNumberPdf(String receiptNumber, String preparedBy, String userEmail);

    byte[] generateCancellationSlipPdf(Long bookingId, String preparedBy, String userEmail);
}