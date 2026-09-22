package com.athenura.hotel_management_system.campaign.repository;


import com.athenura.hotel_management_system.campaign.entity.Campaign;
import com.athenura.hotel_management_system.campaign.enums.CampaignStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    List<Campaign> findByIsDeletedFalse();

    List<Campaign> findByIsDeletedTrue();

    Optional<Campaign> findByIdAndIsDeletedFalse(Long id);

    List<Campaign> findByStatusAndScheduleLessThanEqual(CampaignStatus status, LocalDateTime now);

    List<Campaign> findByStatusAndScheduleLessThanEqualAndIsDeletedFalse(
            CampaignStatus status,
            LocalDateTime currentDateTime
    );
}
