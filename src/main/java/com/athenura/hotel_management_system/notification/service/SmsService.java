package com.athenura.hotel_management_system.notification.service;

public interface SmsService {

    void sendSms(String phoneNumber, String message);

}