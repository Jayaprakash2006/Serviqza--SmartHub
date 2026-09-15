package com.serviqza.dto;

public class DashboardStatsDto {

    private long totalUsers;
    private long totalProviders;
    private long totalRentalItems;
    private long totalServiceRequests;
    private long totalRentalBookings;
    private long totalFuelRequests;
    private long activeHelpers;

    public DashboardStatsDto() {
    }

    public DashboardStatsDto(long totalUsers, long totalProviders, long totalRentalItems,
                             long totalServiceRequests, long totalRentalBookings,
                             long totalFuelRequests, long activeHelpers) {
        this.totalUsers = totalUsers;
        this.totalProviders = totalProviders;
        this.totalRentalItems = totalRentalItems;
        this.totalServiceRequests = totalServiceRequests;
        this.totalRentalBookings = totalRentalBookings;
        this.totalFuelRequests = totalFuelRequests;
        this.activeHelpers = activeHelpers;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalProviders() {
        return totalProviders;
    }

    public void setTotalProviders(long totalProviders) {
        this.totalProviders = totalProviders;
    }

    public long getTotalRentalItems() {
        return totalRentalItems;
    }

    public void setTotalRentalItems(long totalRentalItems) {
        this.totalRentalItems = totalRentalItems;
    }

    public long getTotalServiceRequests() {
        return totalServiceRequests;
    }

    public void setTotalServiceRequests(long totalServiceRequests) {
        this.totalServiceRequests = totalServiceRequests;
    }

    public long getTotalRentalBookings() {
        return totalRentalBookings;
    }

    public void setTotalRentalBookings(long totalRentalBookings) {
        this.totalRentalBookings = totalRentalBookings;
    }

    public long getTotalFuelRequests() {
        return totalFuelRequests;
    }

    public void setTotalFuelRequests(long totalFuelRequests) {
        this.totalFuelRequests = totalFuelRequests;
    }

    public long getActiveHelpers() {
        return activeHelpers;
    }

    public void setActiveHelpers(long activeHelpers) {
        this.activeHelpers = activeHelpers;
    }
}
