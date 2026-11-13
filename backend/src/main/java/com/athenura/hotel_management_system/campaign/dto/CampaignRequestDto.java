package com.athenura.hotel_management_system.campaign.dto;

import com.athenura.hotel_management_system.campaign.enums.CampaignType;
import com.athenura.hotel_management_system.campaign.enums.TargetAudience;
import com.fasterxml.jackson.annotation.JsonFormat;
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

    private Double filterMinSpending;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm[:ss]")
    private LocalDateTime schedule;

    private String filterRoomType;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate filterStartDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate filterEndDate;


}
