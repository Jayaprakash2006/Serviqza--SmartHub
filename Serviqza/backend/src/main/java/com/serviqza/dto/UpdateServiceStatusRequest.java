package com.serviqza.dto;

import com.serviqza.model.RequestStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateServiceStatusRequest {

    @NotNull(message = "Status is required")
    private RequestStatus status;

    public UpdateServiceStatusRequest() {
    }

    public UpdateServiceStatusRequest(RequestStatus status) {
        this.status = status;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }
}
