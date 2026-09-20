package com.athenura.hotel_management_system.campaign.service.serviceImpl;

import com.athenura.hotel_management_system.campaign.dto.CampaignRequestDto;
import com.athenura.hotel_management_system.campaign.dto.CampaignResponseDto;
import com.athenura.hotel_management_system.campaign.entity.Campaign;
import com.athenura.hotel_management_system.campaign.enums.CampaignStatus;
import com.athenura.hotel_management_system.campaign.mapper.CampaignMapper;
import com.athenura.hotel_management_system.campaign.repository.CampaignRepository;
import com.athenura.hotel_management_system.campaign.service.CampaignService;
import com.athenura.hotel_management_system.guest.entity.Guest;
import com.athenura.hotel_management_system.guest.repository.GuestRepository;
import com.athenura.hotel_management_system.notification.service.EmailService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CampaignServiceImpl implements CampaignService {

    private final CampaignRepository campaignRepository;
    private final CampaignMapper campaignMapper;
    private final GuestRepository guestRepository;
    private final EmailService emailService;

    @Override
    public CampaignResponseDto createCampaign(CampaignRequestDto dto) {
        Campaign campaign = campaignMapper.toEntity(dto);
        return campaignMapper.toDto(campaignRepository.save(campaign));
    }

    @Override
    public CampaignResponseDto getCampaignById(Long id) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found with id: " + id));
        return campaignMapper.toDto(campaign);
    }

    @Override
    public List<CampaignResponseDto> getAllCampaigns() {
        return campaignRepository.findAll().stream()
                .map(campaignMapper::toDto)
                .toList();
    }

    @Override
    public List<Guest> resolveAudience(Long campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found with id: " + campaignId));

        switch (campaign.getTargetAudience()) {
            case ALL_CUSTOMERS:
                return guestRepository.findAll();

            case FREQUENT_VISITORS:
                return guestRepository.findFrequentVisitors();

            case BY_ROOM_TYPE:
                if (campaign.getFilterRoomType() != null) {
                    return guestRepository.findByBookedRoomType(campaign.getFilterRoomType());
                }
                return Collections.emptyList();

            case BY_DATE_RANGE:
                if (campaign.getFilterStartDate() != null && campaign.getFilterEndDate() != null) {
                    return guestRepository.findByStayDateRange(
                            campaign.getFilterStartDate(),
                            campaign.getFilterEndDate()
                    );
                }
                return Collections.emptyList();

            case BY_SPENDING:
                if (campaign.getFilterMinSpending() != null) {
                    return guestRepository.findByTotalSpending(campaign.getFilterMinSpending());
                }
                return Collections.emptyList();

            case UPCOMING_BIRTHDAYS:
                return guestRepository.findUpcomingBirthdays(7);

            case STAY_ANNIVERSARIES:
                return guestRepository.findUpcomingStayAnniversaries(7);

            default:
                return Collections.emptyList();
        }
    }

    @Override
    @Transactional
    public CampaignResponseDto sendCampaign(Long campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found with id: " + campaignId));

        List<Guest> audience = resolveAudience(campaignId);
        log.info("Campaign ID {} resolved audience count: {}", campaignId, audience.size());

        for (Guest guest : audience) {
            log.info("Processing guest ID: {}, email: {}", guest.getId(), guest.getEmail());
            if (guest.getEmail() != null && !guest.getEmail().isBlank()) {
                String recipientName = (guest.getFirstName() != null) ? guest.getFirstName() : "Valued Guest";
                String personalizedBody = campaign.getEmailContent().replace("{name}", recipientName);

                emailService.sendCampaignEmail(
                        guest.getEmail(),
                        recipientName,
                        campaign.getSubjectLine(),
                        personalizedBody
                );
            }
        }

        campaign.setStatus(CampaignStatus.SENT);
        return campaignMapper.toDto(campaignRepository.save(campaign));
    }

    @Override
    public void deleteCampaign(Long id) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Campaign not found with id: "+ id));

        campaign.setIsDeleted(true);
        campaignRepository.save(campaign);
        log.info("Campaign with id {} soft-deleted successfully", id);

    }

    @Override
    public List<CampaignResponseDto> getCampaignHistory() {
        return campaignRepository.findByIsDeletedTrue().stream()
                .map(campaignMapper::toDto)
                .toList();
    }


    @Override
    @Transactional
    public void processScheduledCampaigns() {
        List<Campaign> dueCampaigns = campaignRepository
                .findByStatusAndScheduleLessThanEqualAndIsDeletedFalse(
                        CampaignStatus.SCHEDULED,
                        LocalDateTime.now()
                );

        if (!dueCampaigns.isEmpty()) {
            log.info("Found {} scheduled campaign(s) to process", dueCampaigns.size());
        }

        for (Campaign campaign : dueCampaigns) {
            try {
                log.info("Executing scheduled campaign: {} (ID: {})", campaign.getCampaignName(), campaign.getId());
                sendCampaign(campaign.getId());
            } catch (Exception e) {
                log.error("Failed to send scheduled campaign ID {}: {}", campaign.getId(), e.getMessage());
            }
        }
    }


}