package com.athenura.hotel_management_system.extraservice.repository;

import com.athenura.hotel_management_system.extraservice.entity.ExtraService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExtraServiceRepository extends JpaRepository<ExtraService, Long> {

    List<ExtraService> findByBookingIdIsNull();
    List<ExtraService> findByActiveTrueAndBookingIdIsNull();
    List<ExtraService> findByCategoryAndActiveTrueAndBookingIdIsNull(String category);
}