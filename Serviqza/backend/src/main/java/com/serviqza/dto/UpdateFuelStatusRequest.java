package com.serviqza.dto;

import com.serviqza.model.FuelStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateFuelStatusRequest {

    @NotNull(message = "Status is required")
    private FuelStatus status;

    public UpdateFuelStatusRequest() {
    }

    public UpdateFuelStatusRequest(FuelStatus status) {
        this.status = status;
    }

    public FuelStatus getStatus() {
        return status;
    }

    public void setStatus(FuelStatus status) {
        this.status = status;
    }
}
