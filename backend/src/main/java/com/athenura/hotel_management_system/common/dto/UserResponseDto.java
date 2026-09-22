package com.athenura.hotel_management_system.common.dto;

import com.athenura.hotel_management_system.common.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponseDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private Role role;
    private String secretKey;
}