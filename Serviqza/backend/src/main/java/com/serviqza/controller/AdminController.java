package com.serviqza.controller;

import com.serviqza.dto.DashboardStatsDto;
import com.serviqza.model.*;
import com.serviqza.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleUserStatus(id));
    }

    @GetMapping("/providers")
    public ResponseEntity<List<ServiceProviderProfile>> getAllProviders() {
        return ResponseEntity.ok(adminService.getAllProviders());
    }

    @GetMapping("/rentals")
    public ResponseEntity<List<RentalItem>> getAllRentals() {
        return ResponseEntity.ok(adminService.getAllRentalItems());
    }

    @GetMapping("/services")
    public ResponseEntity<List<ServiceRequest>> getAllServices() {
        return ResponseEntity.ok(adminService.getAllServiceRequests());
    }

    @GetMapping("/fuel-requests")
    public ResponseEntity<List<FuelRequest>> getAllFuelRequests() {
        return ResponseEntity.ok(adminService.getAllFuelRequests());
    }

    @GetMapping("/rental-bookings")
    public ResponseEntity<List<RentalBooking>> getAllRentalBookings() {
        return ResponseEntity.ok(adminService.getAllRentalBookings());
    }
}
