package com.athenura.hotel_management_system.guest.entity;

import com.athenura.hotel_management_system.guest.enums.IdProofType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Guest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    // for OTP verification and communication
    @Column(nullable = false)
    private String phone;

    private String email;

    @Enumerated(EnumType.STRING)
    private IdProofType idProofType;

    private String idProofNumber;

    // not mandatory for all guests
    private String address;

    private String city;

    private String state;

    private String postalCode;
}