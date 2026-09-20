package com.athenura.hotel_management_system.campaign.entity;

import com.athenura.hotel_management_system.campaign.enums.CampaignStatus;
import com.athenura.hotel_management_system.campaign.enums.CampaignType;
import com.athenura.hotel_management_system.campaign.enums.TargetAudience;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;




@Entity
@Table(name = "campaigns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String campaignName;

    @Column(nullable = false)
    private String subjectLine;

    @Lob
    @Column(columnDefinition = "TEXT", nullable = false)
    private String emailContent;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TargetAudience targetAudience;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CampaignType campaignType;

    private LocalDateTime schedule;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CampaignStatus status;


    private String filterRoomType;
    private LocalDate filterStartDate;
    private LocalDate filterEndDate;
    private Double filterMinSpending;

    private LocalDateTime createdAt;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;


    @PrePersist
    public void prePersist(){
        if(this.createdAt == null){
            this.createdAt = LocalDateTime.now();
        }

        if(this.status == null){
            this.status = (this.schedule != null) ? CampaignStatus.SCHEDULED : CampaignStatus.DRAFT;
        }

        if(this.isDeleted == null){
            this.isDeleted = false;
        }
    }





}
