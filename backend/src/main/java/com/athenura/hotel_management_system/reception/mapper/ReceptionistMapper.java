package com.athenura.hotel_management_system.reception.mapper;

import com.athenura.hotel_management_system.common.entity.Users;
import com.athenura.hotel_management_system.common.enums.Role;
import com.athenura.hotel_management_system.reception.dto.ReceptionistRequest;
import com.athenura.hotel_management_system.reception.dto.ReceptionistResponse;
import org.springframework.stereotype.Component;


@Component
public class ReceptionistMapper {
    public Users toEntity(ReceptionistRequest request)
    {
        return Users.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(request.getPassword())
                .role(Role.RECEPTIONIST)
                .build();
    }

    public ReceptionistResponse toResponse(Users user){

        return ReceptionistResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
