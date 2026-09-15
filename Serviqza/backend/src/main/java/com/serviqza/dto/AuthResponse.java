package com.serviqza.dto;

import com.serviqza.model.Role;

public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String phone;
    private boolean helperModeActive;
    private boolean available;
    private Double currentLatitude;
    private Double currentLongitude;

    public AuthResponse() {
    }

    public AuthResponse(String token, Long id, String name, String email, Role role, String phone,
                        boolean helperModeActive, boolean available, Double currentLatitude, Double currentLongitude) {
        this.token = token;
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.phone = phone;
        this.helperModeActive = helperModeActive;
        this.available = available;
        this.currentLatitude = currentLatitude;
        this.currentLongitude = currentLongitude;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public boolean isHelperModeActive() {
        return helperModeActive;
    }

    public void setHelperModeActive(boolean helperModeActive) {
        this.helperModeActive = helperModeActive;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public Double getCurrentLatitude() {
        return currentLatitude;
    }

    public void setCurrentLatitude(Double currentLatitude) {
        this.currentLatitude = currentLatitude;
    }

    public Double getCurrentLongitude() {
        return currentLongitude;
    }

    public void setCurrentLongitude(Double currentLongitude) {
        this.currentLongitude = currentLongitude;
    }
}
