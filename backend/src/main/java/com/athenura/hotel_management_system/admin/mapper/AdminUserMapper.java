package com.athenura.hotel_management_system.admin.mapper;

import com.athenura.hotel_management_system.common.dto.UserRequestDto;
import com.athenura.hotel_management_system.common.dto.UserResponseDto;
import com.athenura.hotel_management_system.common.entity.Users;
import org.springframework.stereotype.Component;

@Component
public class AdminUserMapper {
    public Users userToDto(UserRequestDto userdata){
        Users users = new Users();
        users.setUsername(userdata.getUsername());
        users.setEmail(userdata.getEmail());
        users.setPassword(userdata.getPassword());
        users.setRole(userdata.getRole());

        return users;
    }

    public UserResponseDto userResponseToEntity(Users users){
        UserResponseDto userResponseDto = new UserResponseDto();
        userResponseDto.setUsername(users.getUsername());
        userResponseDto.setEmail(users.getEmail());
        userResponseDto.setRole(users.getRole());

        return userResponseDto;
    }

}
