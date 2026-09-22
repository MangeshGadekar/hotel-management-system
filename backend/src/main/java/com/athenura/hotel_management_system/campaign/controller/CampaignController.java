package com.athenura.hotel_management_system.campaign.controller;


import com.athenura.hotel_management_system.campaign.dto.CampaignRequestDto;
import com.athenura.hotel_management_system.campaign.dto.CampaignResponseDto;
import com.athenura.hotel_management_system.campaign.service.CampaignService;
import com.athenura.hotel_management_system.guest.entity.Guest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("admin/campaigns")
@RequiredArgsConstructor
public class CampaignController {
    private final CampaignService campaignService;

    @PostMapping
    public ResponseEntity<CampaignResponseDto> createCampaign(@RequestBody CampaignRequestDto dto){
        return new ResponseEntity<>(campaignService.createCampaign(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CampaignResponseDto>> getAllCampaigns(){
        return ResponseEntity.ok(campaignService.getAllCampaigns());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CampaignResponseDto> getCampaignById(@PathVariable Long id){
        return ResponseEntity.ok(campaignService.getCampaignById(id));
    }

    @GetMapping("/{id}/audience")
    public ResponseEntity<List<Guest>>  previewAudience(@PathVariable Long id){
        return ResponseEntity.ok(campaignService.resolveAudience(id));
    }

    @PostMapping("/{id}/send")
    public ResponseEntity<CampaignResponseDto> sendCampaign(@PathVariable Long id){
        return ResponseEntity.ok(campaignService.sendCampaign(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCampaign(@PathVariable Long id){
        campaignService.deleteCampaign(id);
        return ResponseEntity.ok("Campaign" + id + " has been deleted Successfully");
    }

    @GetMapping("/history")
    public ResponseEntity<List<CampaignResponseDto>> getCampaignHistory(){
        return ResponseEntity.ok(campaignService.getCampaignHistory());
    }


}
