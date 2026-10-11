package com.athenura.hotel_management_system.booking.dto;
import com.athenura.hotel_management_system.extraservice.dto.ExtraServiceResponse;
import com.athenura.hotel_management_system.payment.dto.PaymentDTO;
import com.athenura.hotel_management_system.booking.enums.BookingStatus;
import com.athenura.hotel_management_system.payment.dto.PaymentDTO;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private Long id;


    private Long guestId;
    private String guestName;
    private String guestEmail;
    private String guestPhone;


    private Long roomId;
    private String roomNumber;
    private String roomType;


    private Long receptionistId;
    private String receptionistName;


    private LocalDate checkInDate;
    private LocalDate checkOutDate;


    private BigDecimal roomCharges;
    private BigDecimal extraServicesTotal;
    private BigDecimal subtotal;
    private String couponCode;
    private BigDecimal discountAmount;
    private BigDecimal taxableAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private BigDecimal advancePayment;
    private BigDecimal balanceDue;

    private BookingStatus bookingStatus;

    private List<ExtraServiceResponse> selectedExtraServices;
}