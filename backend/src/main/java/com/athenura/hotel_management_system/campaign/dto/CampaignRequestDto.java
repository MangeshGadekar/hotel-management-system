package com.athenura.hotel_management_system.campaign.dto;

import com.athenura.hotel_management_system.campaign.enums.CampaignType;
import com.athenura.hotel_management_system.campaign.enums.TargetAudience;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampaignRequestDto {

    private String campaignName;
    private String subjectLine;
    private String emailContent;
    private TargetAudience targetAudience;
    private CampaignType campaignType;
    private LocalDateTime schedule;

    private String filterRoomType;
    private LocalDate filterStartDate;
    private LocalDate filterEndDate;
    private Double filterMinSpending;


}
