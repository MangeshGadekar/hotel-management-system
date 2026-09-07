package com.athenura.hotel_management_system.guest.dto;

import com.athenura.hotel_management_system.guest.enums.IdProofType;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestRequest {

    private String firstName;
    private String lastName;
    private String phone;
    private String email;

    private IdProofType idProofType;
    private String idProofNumber;

    private String address;
    private String city;
    private String state;
    private String postalCode;
}