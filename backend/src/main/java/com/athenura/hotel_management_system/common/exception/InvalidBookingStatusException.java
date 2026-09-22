package com.athenura.hotel_management_system.common.exception;

public class InvalidBookingStatusException extends RuntimeException {

    public InvalidBookingStatusException(String message) {
        super(message);
    }
}