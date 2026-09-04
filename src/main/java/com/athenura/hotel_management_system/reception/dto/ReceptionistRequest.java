package com.athenura.hotel_management_system.reception.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReceptionistRequest {
    private String firstName;

    private String lastName;

    private String username;

    @Email(message = "Invalid email")
    private String email;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}
