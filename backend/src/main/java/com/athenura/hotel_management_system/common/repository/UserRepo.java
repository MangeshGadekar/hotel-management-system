package com.athenura.hotel_management_system.common.repository;

import com.athenura.hotel_management_system.common.entity.Users;
import com.athenura.hotel_management_system.common.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<Users, Long> {

    Optional<Users> findByEmail(String email);

    Optional<Users> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    List<Users> findAllByRole(Role role);

    Optional<Users> findByIdAndRole(Long id, Role role);
}
