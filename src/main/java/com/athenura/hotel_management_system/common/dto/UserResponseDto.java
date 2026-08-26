package com.athenura.hotel_management_system.common.dto;

import com.athenura.hotel_management_system.common.enums.Role;
import lombok.Data;

@Data
public class UserResponseDto {

    String username;
    String email;
    Role role;

}
