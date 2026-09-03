package com.athenura.hotel_management_system.common.dto;
import com.athenura.hotel_management_system.common.enums.Role;
import lombok.Data;

@Data
public class UserRequestDto {

    String username;
    String email;
    String password;
    Role role;

}
