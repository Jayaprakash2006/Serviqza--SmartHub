package com.serviqza.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fuel_requests")
public class FuelRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @Column(name = "fuel_type", nullable = false)
    private String fuelType;

    @Column(nullable = false)
    private Double quantity;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private String address;

    @Column(length = 1000)
    private String description;

    @Column(name = "optional_tip")
    private Double optionalTip = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FuelStatus status = FuelStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "assigned_helper_id")
    private User assignedHelper;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public FuelRequest() {
    }

    public FuelRequest(User requester, String fuelType, Double quantity, Double latitude, Double longitude, String address, String description, Double optionalTip) {
        this.requester = requester;
        this.fuelType = fuelType;
        this.quantity = quantity;
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
        this.description = description;
        this.optionalTip = optionalTip;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getRequester() {
        return requester;
    }

    public void setRequester(User requester) {
        this.requester = requester;
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

    public User getAssignedHelper() {
        return assignedHelper;
    }

    public void setAssignedHelper(User assignedHelper) {
        this.assignedHelper = assignedHelper;
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
}
