package com.athenura.hotel_management_system.room.repository;

import com.athenura.hotel_management_system.room.entity.Room;
import com.athenura.hotel_management_system.room.enums.RoomStatus;
import com.athenura.hotel_management_system.room.enums.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByRoomNumber(String roomNumber);

    boolean existsByRoomNumber(String roomNumber);

    List<Room> findByRoomType(RoomType roomType);

    List<Room> findByRoomStatus(RoomStatus roomStatus);

    List<Room> findByRoomTypeAndRoomStatus(RoomType roomType, RoomStatus roomStatus);
}
