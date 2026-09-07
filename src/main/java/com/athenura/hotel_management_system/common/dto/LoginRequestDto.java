package com.athenura.hotel_management_system.common.dto;


import lombok.Data;

@Data
public class LoginRequestDto {
    private String email;
    private String password;
}
