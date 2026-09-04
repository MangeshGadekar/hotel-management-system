package com.athenura.hotel_management_system.reception.dto;

import com.athenura.hotel_management_system.common.enums.Role;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReceptionistResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private Role role;
}
