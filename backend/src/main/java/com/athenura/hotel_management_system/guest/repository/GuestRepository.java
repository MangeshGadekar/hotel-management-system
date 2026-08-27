package com.athenura.hotel_management_system.guest.repository;

import com.athenura.hotel_management_system.guest.entity.Guest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GuestRepository extends JpaRepository<Guest, Long> {

}
