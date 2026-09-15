package com.serviqza.service;

import com.serviqza.dto.*;
import com.serviqza.exception.BadRequestException;
import com.serviqza.exception.ConflictException;
import com.serviqza.exception.ResourceNotFoundException;
import com.serviqza.model.FuelRequest;
import com.serviqza.model.FuelReview;
import com.serviqza.model.FuelStatus;
import com.serviqza.model.User;
import com.serviqza.repository.FuelRequestRepository;
import com.serviqza.repository.FuelReviewRepository;
import com.serviqza.repository.UserRepository;
import com.serviqza.util.HaversineUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class FuelAssistanceService {

    private final FuelRequestRepository fuelRequestRepository;
    private final FuelReviewRepository fuelReviewRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    public FuelAssistanceService(FuelRequestRepository fuelRequestRepository,
                                 FuelReviewRepository fuelReviewRepository,
                                 UserRepository userRepository,
                                 AuthService authService) {
        this.fuelRequestRepository = fuelRequestRepository;
        this.fuelReviewRepository = fuelReviewRepository;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    /**
     * Calculates dynamic adaptive radius in km based on elapsed time since request creation:
     * 0 - 2 minutes: 3 km
     * 2 - 5 minutes: 5 km
     * 5+ minutes: 10 km (max capped radius)
     */
    public double getAdaptiveRadiusKm(LocalDateTime createdAt) {
        if (createdAt == null) return 3.0;
        long minutesElapsed = Duration.between(createdAt, LocalDateTime.now()).toMinutes();
        if (minutesElapsed < 2) {
            return 3.0;
        } else if (minutesElapsed < 5) {
            return 5.0;
        } else {
            return 10.0;
        }
    }

    @Transactional
    public FuelRequestResponse createFuelRequest(CreateFuelRequest request) {
        User requester = authService.getCurrentAuthenticatedUser();

        FuelRequest fuelRequest = new FuelRequest(
                requester,
                request.getFuelType(),
                request.getQuantity(),
                request.getLatitude(),
                request.getLongitude(),
                request.getAddress(),
                request.getDescription(),
                request.getOptionalTip() != null ? request.getOptionalTip() : 0.0
        );

        FuelRequest saved = fuelRequestRepository.save(fuelRequest);
        return FuelRequestResponse.fromEntity(saved, 0.0, 3.0);
    }

    public List<FuelRequestResponse> getMyFuelRequests() {
        User requester = authService.getCurrentAuthenticatedUser();
        List<FuelRequest> list = fuelRequestRepository.findByRequesterOrderByCreatedAtDesc(requester);
        List<FuelRequestResponse> responses = new ArrayList<>();
        for (FuelRequest fr : list) {
            double radius = getAdaptiveRadiusKm(fr.getCreatedAt());
            responses.add(FuelRequestResponse.fromEntity(fr, null, radius));
        }
        return responses;
    }

    public List<FuelRequestResponse> getMyAcceptedFuelRequests() {
        User helper = authService.getCurrentAuthenticatedUser();
        List<FuelRequest> list = fuelRequestRepository.findByAssignedHelperOrderByCreatedAtDesc(helper);
        List<FuelRequestResponse> responses = new ArrayList<>();
        for (FuelRequest fr : list) {
            Double distance = null;
            if (helper.getCurrentLatitude() != null && helper.getCurrentLongitude() != null) {
                distance = HaversineUtil.calculateDistance(
                        fr.getLatitude(), fr.getLongitude(),
                        helper.getCurrentLatitude(), helper.getCurrentLongitude()
                );
            }
            responses.add(FuelRequestResponse.fromEntity(fr, distance, getAdaptiveRadiusKm(fr.getCreatedAt())));
        }
        return responses;
    }

    public FuelRequestResponse getFuelRequestById(Long id) {
        FuelRequest fr = fuelRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fuel request not found with ID: " + id));

        User currentUser = authService.getCurrentAuthenticatedUser();
        Double distance = null;
        if (currentUser.getCurrentLatitude() != null && currentUser.getCurrentLongitude() != null) {
            distance = HaversineUtil.calculateDistance(
                    fr.getLatitude(), fr.getLongitude(),
                    currentUser.getCurrentLatitude(), currentUser.getCurrentLongitude()
            );
        }

        return FuelRequestResponse.fromEntity(fr, distance, getAdaptiveRadiusKm(fr.getCreatedAt()));
    }

    /**
     * Finds nearby pending fuel requests for an active helper.
     * Evaluates Haversine distance and filters strictly within the adaptive radius (3km -> 5km -> 10km).
     */
    public List<FuelRequestResponse> getNearbyFuelRequests() {
        User helper = authService.getCurrentAuthenticatedUser();

        if (!helper.isHelperModeActive()) {
            throw new BadRequestException("Helper mode is not active. Please enable helper mode first.");
        }

        if (!helper.isAvailable()) {
            throw new BadRequestException("Helper status is set to unavailable.");
        }

        if (helper.getCurrentLatitude() == null || helper.getCurrentLongitude() == null) {
            throw new BadRequestException("Helper location is not set. Please share current coordinates.");
        }

        double helperLat = helper.getCurrentLatitude();
        double helperLon = helper.getCurrentLongitude();

        List<FuelRequest> pendingRequests = fuelRequestRepository.findByStatus(FuelStatus.PENDING);
        List<FuelRequestResponse> nearby = new ArrayList<>();

        for (FuelRequest fr : pendingRequests) {
            // Cannot accept own request
            if (fr.getRequester().getId().equals(helper.getId())) {
                continue;
            }

            double distance = HaversineUtil.calculateDistance(fr.getLatitude(), fr.getLongitude(), helperLat, helperLon);
            double currentRadius = getAdaptiveRadiusKm(fr.getCreatedAt());

            if (distance <= currentRadius) {
                nearby.add(FuelRequestResponse.fromEntity(fr, distance, currentRadius));
            }
        }

        // Sort nearest first
        nearby.sort(Comparator.comparingDouble(FuelRequestResponse::getDistanceKm));
        return nearby;
    }

    /**
     * Atomic single-winner acceptance.
     * If multiple helpers race to accept, only ONE helper gets rowsUpdated = 1.
     * Any other helper receives 409 Conflict.
     */
    @Transactional
    public FuelRequestResponse acceptFuelRequest(Long id) {
        User helper = authService.getCurrentAuthenticatedUser();

        if (!helper.isHelperModeActive()) {
            throw new BadRequestException("Must enable helper mode to accept emergency fuel requests");
        }

        FuelRequest existing = fuelRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fuel request not found with ID: " + id));

        if (existing.getRequester().getId().equals(helper.getId())) {
            throw new BadRequestException("Cannot accept your own fuel request");
        }

        if (existing.getStatus() != FuelStatus.PENDING) {
            throw new ConflictException("Request already accepted by another helper");
        }

        int updatedCount = fuelRequestRepository.atomicallyAcceptFuelRequest(id, helper, LocalDateTime.now());
        if (updatedCount == 0) {
            throw new ConflictException("Request already accepted by another helper");
        }

        FuelRequest accepted = fuelRequestRepository.findById(id).orElseThrow();
        Double distance = null;
        if (helper.getCurrentLatitude() != null && helper.getCurrentLongitude() != null) {
            distance = HaversineUtil.calculateDistance(
                    accepted.getLatitude(), accepted.getLongitude(),
                    helper.getCurrentLatitude(), helper.getCurrentLongitude()
            );
        }

        return FuelRequestResponse.fromEntity(accepted, distance, getAdaptiveRadiusKm(accepted.getCreatedAt()));
    }

    @Transactional
    public FuelRequestResponse updateFuelRequestStatus(Long id, UpdateFuelStatusRequest statusRequest) {
        User helper = authService.getCurrentAuthenticatedUser();
        FuelRequest fr = fuelRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fuel request not found with ID: " + id));

        if (fr.getAssignedHelper() == null || !fr.getAssignedHelper().getId().equals(helper.getId())) {
            throw new BadRequestException("Only the assigned helper can update assistance status");
        }

        FuelStatus current = fr.getStatus();
        FuelStatus target = statusRequest.getStatus();

        if (current == FuelStatus.COMPLETED || current == FuelStatus.CANCELLED) {
            throw new BadRequestException("Cannot change status of a " + current + " request");
        }

        if (target == FuelStatus.ON_THE_WAY && current != FuelStatus.ACCEPTED) {
            throw new BadRequestException("Can only set ON_THE_WAY after ACCEPTED");
        } else if (target == FuelStatus.ARRIVED && current != FuelStatus.ON_THE_WAY) {
            throw new BadRequestException("Can only set ARRIVED after ON_THE_WAY");
        } else if (target == FuelStatus.COMPLETED && current != FuelStatus.ARRIVED) {
            throw new BadRequestException("Can only COMPLETE from ARRIVED status");
        }

        if (target == FuelStatus.COMPLETED) {
            fr.setCompletedAt(LocalDateTime.now());
        }

        fr.setStatus(target);
        FuelRequest saved = fuelRequestRepository.save(fr);
        return FuelRequestResponse.fromEntity(saved, null, getAdaptiveRadiusKm(saved.getCreatedAt()));
    }

    @Transactional
    public FuelRequestResponse cancelFuelRequest(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        FuelRequest fr = fuelRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fuel request not found with ID: " + id));

        boolean isRequester = fr.getRequester().getId().equals(user.getId());
        boolean isHelper = fr.getAssignedHelper() != null && fr.getAssignedHelper().getId().equals(user.getId());

        if (!isRequester && !isHelper) {
            throw new BadRequestException("Not authorized to cancel this fuel request");
        }

        if (fr.getStatus() == FuelStatus.COMPLETED || fr.getStatus() == FuelStatus.CANCELLED) {
            throw new BadRequestException("Cannot cancel a " + fr.getStatus() + " request");
        }

        fr.setStatus(FuelStatus.CANCELLED);
        FuelRequest saved = fuelRequestRepository.save(fr);
        return FuelRequestResponse.fromEntity(saved, null, getAdaptiveRadiusKm(saved.getCreatedAt()));
    }

    @Transactional
    public void toggleHelperMode(HelperModeRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        user.setHelperModeActive(request.getEnabled());
        if (request.getAvailable() != null) {
            user.setAvailable(request.getAvailable());
        }
        userRepository.save(user);
    }

    @Transactional
    public void updateHelperLocation(HelperLocationRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        user.setCurrentLatitude(request.getLatitude());
        user.setCurrentLongitude(request.getLongitude());
        user.setLastLocationUpdate(LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public FuelReview submitFuelReview(Long id, CreateReviewRequest reviewRequest) {
        User requester = authService.getCurrentAuthenticatedUser();
        FuelRequest fr = fuelRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fuel request not found with ID: " + id));

        if (!fr.getRequester().getId().equals(requester.getId())) {
            throw new BadRequestException("Only the requester can rate this assistance");
        }

        if (fr.getStatus() != FuelStatus.COMPLETED) {
            throw new BadRequestException("Reviews can only be submitted after assistance is COMPLETED");
        }

        if (fr.getAssignedHelper() == null) {
            throw new BadRequestException("No assigned helper to review");
        }

        if (fuelReviewRepository.existsByFuelRequestId(id)) {
            throw new ConflictException("You have already reviewed this emergency assistance");
        }

        FuelReview review = new FuelReview(
                fr,
                requester,
                fr.getAssignedHelper(),
                reviewRequest.getRating(),
                reviewRequest.getComment()
        );
        FuelReview savedReview = fuelReviewRepository.save(review);

        // Update helper rating
        Double avgRating = fuelReviewRepository.calculateAverageRating(fr.getAssignedHelper().getId());
        Integer count = fuelReviewRepository.countByHelperId(fr.getAssignedHelper().getId());

        User helper = fr.getAssignedHelper();
        helper.setHelperRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 5.0);
        helper.setHelperRatingCount(count != null ? count : 0);
        userRepository.save(helper);

        return savedReview;
    }
}
