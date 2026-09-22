package com.athenura.hotel_management_system.guest.repository;

import com.athenura.hotel_management_system.campaign.entity.Campaign;
import com.athenura.hotel_management_system.campaign.enums.CampaignStatus;
import com.athenura.hotel_management_system.guest.entity.Guest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GuestRepository extends JpaRepository<Guest, Long> {

    @Query("SELECT b.guest FROM Booking b GROUP BY b.guest HAVING COUNT(b.id) >= 3")
    List<Guest> findFrequentVisitors();

    @Query("SELECT DISTINCT b.guest FROM Booking b WHERE b.room.roomType = :roomType")
    List<Guest> findByBookedRoomType(@Param("roomType") String roomType);

    @Query("SELECT DISTINCT b.guest FROM Booking b WHERE b.checkInDate BETWEEN :start AND :end")
    List<Guest> findByStayDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT b.guest FROM Booking b GROUP BY b.guest HAVING SUM(b.totalAmount) >= :minSpending")
    List<Guest> findByTotalSpending(@Param("minSpending") Double minSpending);

    @Query(value = """
        SELECT DISTINCT g.* FROM guest g 
        JOIN booking b ON b.guest_id = g.id
        WHERE g.date_of_birth IS NOT NULL 
          AND (
            (DAYOFYEAR(g.date_of_birth) >= DAYOFYEAR(CURDATE()) 
             AND DAYOFYEAR(g.date_of_birth) <= DAYOFYEAR(DATE_ADD(CURDATE(), INTERVAL :daysAhead DAY)))
            OR 
            (DAYOFYEAR(CURDATE()) + :daysAhead > 365 
             AND DAYOFYEAR(g.date_of_birth) <= (DAYOFYEAR(CURDATE()) + :daysAhead) % 365)
          )
        """, nativeQuery = true)
    List<Guest> findUpcomingBirthdays(@Param("daysAhead") int daysAhead);

    @Query(value = """
        SELECT DISTINCT g.* FROM guest g
        JOIN booking b ON b.guest_id = g.id
        WHERE YEAR(b.check_in_date) < YEAR(CURDATE())
          AND (
            (DATE_FORMAT(b.check_in_date, '%m-%d') >= DATE_FORMAT(CURDATE(), '%m-%d')
             AND DATE_FORMAT(b.check_in_date, '%m-%d') <= DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL :daysAhead DAY), '%m-%d'))
            OR
            (DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL :daysAhead DAY), '%m-%d') < DATE_FORMAT(CURDATE(), '%m-%d')
             AND (DATE_FORMAT(b.check_in_date, '%m-%d') >= DATE_FORMAT(CURDATE(), '%m-%d')
                  OR DATE_FORMAT(b.check_in_date, '%m-%d') <= DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL :daysAhead DAY), '%m-%d')))
          )
        """, nativeQuery = true)
    List<Guest> findUpcomingStayAnniversaries(@Param("daysAhead") int daysAhead);



}