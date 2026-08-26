package com.athenura.hotel_management_system.common.exception;

public class BookingOverlapException extends RuntimeException {

    public BookingOverlapException(String message) {
        super(message);
    }
}