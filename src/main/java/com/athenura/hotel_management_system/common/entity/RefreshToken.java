package com.athenura.hotel_management_system.common.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String token;

    private Instant expiryDate;

    @OneToOne
    @JoinColumn(name = "user_id")
    private Users user;

}