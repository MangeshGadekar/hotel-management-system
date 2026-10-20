package com.athenura.hotel_management_system.guest.entity;

import com.athenura.hotel_management_system.guest.enums.IdProofType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

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

    @Column(nullable = false, unique = true, length = 10)
    private String phone;

    @Column(nullable = false, unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    private IdProofType idProofType;

    private String idProofNumber;

    private String address;

    private String city;

    private String state;

    private String postalCode;

    private LocalDate dateOfBirth;

    @Builder.Default
    private Boolean isVerified = false;

    private String createdBy;
}