package com.athenura.hotel_management_system.contact.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactInquiryRequestDTO {

    @NotBlank(message = "Full name is required")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "Email address is required")
    @Email(message = "Invalid email format")
    private String email;

    @Size(max = 25)
    private String phone;

    @NotBlank(message = "Inquiry type is required")
    @Size(max = 100)
    private String subject;

    @NotBlank(message = "Message is required")
    @Size(max = 2000)
    private String message;
}