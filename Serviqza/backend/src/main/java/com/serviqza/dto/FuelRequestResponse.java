package com.serviqza.dto;

import com.serviqza.model.FuelRequest;
import com.serviqza.model.FuelStatus;

import java.time.LocalDateTime;

public class FuelRequestResponse {

    private Long id;
    private Long requesterId;
    private String requesterName;
    private String requesterPhone;
    private String fuelType;
    private Double quantity;
    private Double latitude;
    private Double longitude;
    private String address;
    private String description;
    private Double optionalTip;
    private FuelStatus status;
    private Long assignedHelperId;
    private String assignedHelperName;
    private String assignedHelperPhone;
    private Double assignedHelperRating;
    private LocalDateTime createdAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime completedAt;
    private Double distanceKm;
    private Double currentRadiusKm;

    public FuelRequestResponse() {
    }

    public static FuelRequestResponse fromEntity(FuelRequest request, Double distanceKm, Double currentRadiusKm) {
        FuelRequestResponse dto = new FuelRequestResponse();
        dto.setId(request.getId());
        dto.setRequesterId(request.getRequester().getId());
        dto.setRequesterName(request.getRequester().getName());
        dto.setRequesterPhone(request.getRequester().getPhone());
        dto.setFuelType(request.getFuelType());
        dto.setQuantity(request.getQuantity());
        dto.setLatitude(request.getLatitude());
        dto.setLongitude(request.getLongitude());
        dto.setAddress(request.getAddress());
        dto.setDescription(request.getDescription());
        dto.setOptionalTip(request.getOptionalTip());
        dto.setStatus(request.getStatus());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setAcceptedAt(request.getAcceptedAt());
        dto.setCompletedAt(request.getCompletedAt());
        dto.setDistanceKm(distanceKm);
        dto.setCurrentRadiusKm(currentRadiusKm);

        if (request.getAssignedHelper() != null) {
            dto.setAssignedHelperId(request.getAssignedHelper().getId());
            dto.setAssignedHelperName(request.getAssignedHelper().getName());
            dto.setAssignedHelperPhone(request.getAssignedHelper().getPhone());
            dto.setAssignedHelperRating(request.getAssignedHelper().getHelperRating());
        }

        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(Long requesterId) {
        this.requesterId = requesterId;
    }

    public String getRequesterName() {
        return requesterName;
    }

    public void setRequesterName(String requesterName) {
        this.requesterName = requesterName;
    }

    public String getRequesterPhone() {
        return requesterPhone;
    }

    public void setRequesterPhone(String requesterPhone) {
        this.requesterPhone = requesterPhone;
    }

    public String getFuelType() {
        return fuelType;
    }

    public void setFuelType(String fuelType) {
        this.fuelType = fuelType;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getOptionalTip() {
        return optionalTip;
    }

    public void setOptionalTip(Double optionalTip) {
        this.optionalTip = optionalTip;
    }

    public FuelStatus getStatus() {
        return status;
    }

    public void setStatus(FuelStatus status) {
        this.status = status;
    }

    public Long getAssignedHelperId() {
        return assignedHelperId;
    }

    public void setAssignedHelperId(Long assignedHelperId) {
        this.assignedHelperId = assignedHelperId;
    }

    public String getAssignedHelperName() {
        return assignedHelperName;
    }

    public void setAssignedHelperName(String assignedHelperName) {
        this.assignedHelperName = assignedHelperName;
    }

    public String getAssignedHelperPhone() {
        return assignedHelperPhone;
    }

    public void setAssignedHelperPhone(String assignedHelperPhone) {
        this.assignedHelperPhone = assignedHelperPhone;
    }

    public Double getAssignedHelperRating() {
        return assignedHelperRating;
    }

    public void setAssignedHelperRating(Double assignedHelperRating) {
        this.assignedHelperRating = assignedHelperRating;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(LocalDateTime acceptedAt) {
        this.acceptedAt = acceptedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public Double getCurrentRadiusKm() {
        return currentRadiusKm;
    }

    public void setCurrentRadiusKm(Double currentRadiusKm) {
        this.currentRadiusKm = currentRadiusKm;
    }
}
