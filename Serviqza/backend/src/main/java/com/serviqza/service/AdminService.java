package com.serviqza.service;

import com.serviqza.dto.DashboardStatsDto;
import com.serviqza.exception.ResourceNotFoundException;
import com.serviqza.model.*;
import com.serviqza.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ServiceProviderRepository providerRepository;
    private final RentalItemRepository rentalItemRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final RentalBookingRepository rentalBookingRepository;
    private final FuelRequestRepository fuelRequestRepository;

    public AdminService(UserRepository userRepository,
                        ServiceProviderRepository providerRepository,
                        RentalItemRepository rentalItemRepository,
                        ServiceRequestRepository serviceRequestRepository,
                        RentalBookingRepository rentalBookingRepository,
                        FuelRequestRepository fuelRequestRepository) {
        this.userRepository = userRepository;
        this.providerRepository = providerRepository;
        this.rentalItemRepository = rentalItemRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.rentalBookingRepository = rentalBookingRepository;
        this.fuelRequestRepository = fuelRequestRepository;
    }

    public DashboardStatsDto getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalProviders = providerRepository.count();
        long totalRentalItems = rentalItemRepository.count();
        long totalServiceRequests = serviceRequestRepository.count();
        long totalRentalBookings = rentalBookingRepository.count();
        long totalFuelRequests = fuelRequestRepository.count();
        long activeHelpers = userRepository.findByHelperModeActiveTrueAndAvailableTrue().size();

        return new DashboardStatsDto(
                totalUsers,
                totalProviders,
                totalRentalItems,
                totalServiceRequests,
                totalRentalBookings,
                totalFuelRequests,
                activeHelpers
        );
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        user.setEnabled(!user.isEnabled());
        return userRepository.save(user);
    }

    public List<ServiceProviderProfile> getAllProviders() {
        return providerRepository.findAll();
    }

    public List<RentalItem> getAllRentalItems() {
        return rentalItemRepository.findAll();
    }

    public List<ServiceRequest> getAllServiceRequests() {
        return serviceRequestRepository.findAll();
    }

    public List<FuelRequest> getAllFuelRequests() {
        return fuelRequestRepository.findAll();
    }

    public List<RentalBooking> getAllRentalBookings() {
        return rentalBookingRepository.findAll();
    }
}
