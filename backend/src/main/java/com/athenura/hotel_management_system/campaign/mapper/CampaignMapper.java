package com.athenura.hotel_management_system.campaign.mapper;


import com.athenura.hotel_management_system.campaign.dto.CampaignRequestDto;
import com.athenura.hotel_management_system.campaign.dto.CampaignResponseDto;
import com.athenura.hotel_management_system.campaign.entity.Campaign;
import com.athenura.hotel_management_system.campaign.enums.CampaignStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class CampaignMapper {

    public Campaign toEntity(CampaignRequestDto dto){
        return Campaign.builder()
                .campaignName(dto.getCampaignName())
                .subjectLine((dto.getSubjectLine()))
                .emailContent(dto.getEmailContent())
                .targetAudience(dto.getTargetAudience())
                .campaignType(dto.getCampaignType())
                .schedule(dto.getSchedule())
                .status(dto.getSchedule() != null && dto.getSchedule().isAfter(LocalDateTime.now())
                                ? CampaignStatus.SCHEDULED
                                : CampaignStatus.DRAFT)
                .filterRoomType(dto.getFilterRoomType())
                .filterStartDate(dto.getFilterStartDate())
                .filterEndDate(dto.getFilterEndDate())
                .filterMinSpending(dto.getFilterMinSpending())
                .createdAt(LocalDateTime.now())
                .build();

    }

    public CampaignResponseDto toDto(Campaign entity){
        return CampaignResponseDto.builder()
                .id(entity.getId())
                .campaignName(entity.getCampaignName())
                .subjectLine(entity.getSubjectLine())
                .emailContent(entity.getEmailContent())
                .targetAudience(entity.getTargetAudience())
                .campaignType(entity.getCampaignType())
                .schedule(entity.getSchedule())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();

    }
}
