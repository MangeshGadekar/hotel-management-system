package com.athenura.hotel_management_system.report.repository;

import com.athenura.hotel_management_system.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportBookingRepository extends JpaRepository<Booking, Long> {

    @Query("""
        SELECT b FROM Booking b
        WHERE b.createdAt >= :start AND b.createdAt < :end
        ORDER BY b.createdAt DESC
    """)
    List<Booking> findAllInRange(@Param("start") LocalDateTime start,
                                 @Param("end") LocalDateTime end);

    @Query("""
        SELECT b FROM Booking b
        WHERE b.createdAt >= :start AND b.createdAt < :end
          AND b.receptionist.id = :receptionistId
        ORDER BY b.createdAt DESC
    """)
    List<Booking> findByReceptionistInRange(@Param("receptionistId") Long receptionistId,
                                            @Param("start") LocalDateTime start,
                                            @Param("end") LocalDateTime end);
}