package com.serviqza.dto;

import jakarta.validation.constraints.NotNull;

public class HelperModeRequest {

    @NotNull(message = "Enabled flag is required")
    private Boolean enabled;

    private Boolean available;

    public HelperModeRequest() {
    }

    public HelperModeRequest(Boolean enabled, Boolean available) {
        this.enabled = enabled;
        this.available = available;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }
}
