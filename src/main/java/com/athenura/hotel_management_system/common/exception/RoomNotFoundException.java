package com.athenura.hotel_management_system.common.exception;

public class RoomNotFoundException extends RuntimeException{

    public RoomNotFoundException(String message) {
        super(message);
    }
}
