package com.athenura.hotel_management_system.common.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String firstName;
    private String lastName;
    private String username;
    private String password;
}