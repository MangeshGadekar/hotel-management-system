package com.athenura.hotel_management_system.campaign.service;

import com.athenura.hotel_management_system.campaign.dto.CampaignRequestDto;
import com.athenura.hotel_management_system.campaign.dto.CampaignResponseDto;
import com.athenura.hotel_management_system.guest.entity.Guest;

import java.util.List;

public interface CampaignService {
    CampaignResponseDto createCampaign(CampaignRequestDto dto);

    CampaignResponseDto getCampaignById(Long id);

    List<CampaignResponseDto> getAllCampaigns();
    List<Guest> resolveAudience(Long campaignId);
    CampaignResponseDto sendCampaign(Long campaignId);

    void deleteCampaign(Long id);

    List<CampaignResponseDto> getCampaignHistory();
    void processScheduledCampaigns();

}
