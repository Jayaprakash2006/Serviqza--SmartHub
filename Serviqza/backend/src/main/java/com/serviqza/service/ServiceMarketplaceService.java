package com.serviqza.service;

import com.serviqza.dto.CreateReviewRequest;
import com.serviqza.dto.CreateServiceListingRequest;
import com.serviqza.dto.CreateServiceRequest;
import com.serviqza.dto.UpdateServiceStatusRequest;
import com.serviqza.exception.BadRequestException;
import com.serviqza.exception.ConflictException;
import com.serviqza.exception.ResourceNotFoundException;
import com.serviqza.model.*;
import com.serviqza.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ServiceMarketplaceService {

    private final ServiceCategoryRepository categoryRepository;
    private final ServiceProviderRepository providerRepository;
    private final ServiceListingRepository listingRepository;
    private final ServiceRequestRepository requestRepository;
    private final ServiceReviewRepository reviewRepository;
    private final AuthService authService;

    public ServiceMarketplaceService(ServiceCategoryRepository categoryRepository,
                                     ServiceProviderRepository providerRepository,
                                     ServiceListingRepository listingRepository,
                                     ServiceRequestRepository requestRepository,
                                     ServiceReviewRepository reviewRepository,
                                     AuthService authService) {
        this.categoryRepository = categoryRepository;
        this.providerRepository = providerRepository;
        this.listingRepository = listingRepository;
        this.requestRepository = requestRepository;
        this.reviewRepository = reviewRepository;
        this.authService = authService;
    }

    public List<ServiceCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    public List<ServiceProviderProfile> getAllProviders() {
        return providerRepository.findAll();
    }

    public ServiceProviderProfile getProviderById(Long id) {
        return providerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found with ID: " + id));
    }

    public ServiceProviderProfile getProviderByUserId(Long userId) {
        return providerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found for user ID: " + userId));
    }

    public List<ServiceListing> searchServices(Long categoryId, String keyword) {
        return listingRepository.searchServices(categoryId, keyword);
    }

    public ServiceListing getServiceById(Long id) {
        return listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with ID: " + id));
    }

    @Transactional
    public ServiceListing createServiceListing(CreateServiceListingRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        ServiceProviderProfile provider = providerRepository.findByUser(currentUser)
                .orElseThrow(() -> new BadRequestException("User does not have an active provider profile"));

        ServiceCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        ServiceListing listing = new ServiceListing(
                provider,
                category,
                request.getTitle(),
                request.getDescription(),
                request.getBasePrice()
        );

        return listingRepository.save(listing);
    }

    @Transactional
    public ServiceRequest createServiceRequest(CreateServiceRequest request) {
        User customer = authService.getCurrentAuthenticatedUser();

        ServiceListing listing = listingRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service listing not found"));

        ServiceRequest serviceRequest = new ServiceRequest(
                customer,
                listing.getProvider(),
                listing,
                request.getDescription(),
                request.getAddress(),
                request.getLatitude(),
                request.getLongitude(),
                request.getScheduledDateTime(),
                listing.getBasePrice()
        );

        return requestRepository.save(serviceRequest);
    }

    public List<ServiceRequest> getMyCustomerRequests() {
        User customer = authService.getCurrentAuthenticatedUser();
        return requestRepository.findByCustomerOrderByCreatedAtDesc(customer);
    }

    public List<ServiceRequest> getMyProviderRequests() {
        User user = authService.getCurrentAuthenticatedUser();
        ServiceProviderProfile provider = providerRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("Not a registered provider"));
        return requestRepository.findByProviderOrderByCreatedAtDesc(provider);
    }

    @Transactional
    public ServiceRequest updateRequestStatus(Long requestId, UpdateServiceStatusRequest statusRequest) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found"));

        // Only assigned provider or admin can advance the status
        boolean isProvider = request.getProvider().getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if (!isProvider && !isAdmin) {
            throw new BadRequestException("Only the assigned provider can update request status");
        }

        RequestStatus current = request.getStatus();
        RequestStatus target = statusRequest.getStatus();

        if (current == RequestStatus.COMPLETED || current == RequestStatus.CANCELLED) {
            throw new BadRequestException("Cannot change status of a " + current + " request");
        }

        // Validate allowed transitions
        if (target == RequestStatus.ACCEPTED && current != RequestStatus.PENDING) {
            throw new BadRequestException("Can only accept from PENDING status");
        } else if (target == RequestStatus.ON_THE_WAY && current != RequestStatus.ACCEPTED) {
            throw new BadRequestException("Can only set ON_THE_WAY after ACCEPTED");
        } else if (target == RequestStatus.ARRIVED && current != RequestStatus.ON_THE_WAY) {
            throw new BadRequestException("Can only set ARRIVED after ON_THE_WAY");
        } else if (target == RequestStatus.IN_PROGRESS && current != RequestStatus.ARRIVED) {
            throw new BadRequestException("Can only set IN_PROGRESS after ARRIVED");
        } else if (target == RequestStatus.COMPLETED && current != RequestStatus.IN_PROGRESS) {
            throw new BadRequestException("Can only COMPLETE from IN_PROGRESS status");
        }

        request.setStatus(target);
        return requestRepository.save(request);
    }

    @Transactional
    public ServiceRequest cancelRequest(Long requestId) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found"));

        boolean isCustomer = request.getCustomer().getId().equals(currentUser.getId());
        boolean isProvider = request.getProvider().getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if (!isCustomer && !isProvider && !isAdmin) {
            throw new BadRequestException("You are not authorized to cancel this request");
        }

        if (request.getStatus() == RequestStatus.COMPLETED || request.getStatus() == RequestStatus.CANCELLED) {
            throw new BadRequestException("Cannot cancel a " + request.getStatus() + " request");
        }

        // Customer can only cancel if PENDING or ACCEPTED
        if (isCustomer && request.getStatus() != RequestStatus.PENDING && request.getStatus() != RequestStatus.ACCEPTED) {
            throw new BadRequestException("Cannot cancel after provider is already on the way or in progress");
        }

        request.setStatus(RequestStatus.CANCELLED);
        return requestRepository.save(request);
    }

    @Transactional
    public ServiceReview submitReview(Long requestId, CreateReviewRequest reviewRequest) {
        User customer = authService.getCurrentAuthenticatedUser();
        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found"));

        if (!request.getCustomer().getId().equals(customer.getId())) {
            throw new BadRequestException("Only the customer who created this request can submit a review");
        }

        if (request.getStatus() != RequestStatus.COMPLETED) {
            throw new BadRequestException("Reviews can only be submitted after service is COMPLETED");
        }

        if (reviewRepository.existsByServiceRequestId(requestId)) {
            throw new ConflictException("You have already reviewed this service request");
        }

        ServiceReview review = new ServiceReview(
                request,
                customer,
                request.getProvider(),
                reviewRequest.getRating(),
                reviewRequest.getComment()
        );
        ServiceReview savedReview = reviewRepository.save(review);

        // Update provider aggregate rating
        Double avgRating = reviewRepository.calculateAverageRating(request.getProvider().getId());
        Integer count = reviewRepository.countByProviderId(request.getProvider().getId());

        ServiceProviderProfile provider = request.getProvider();
        provider.setRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 5.0);
        provider.setRatingCount(count != null ? count : 0);
        providerRepository.save(provider);

        return savedReview;
    }

    public List<ServiceReview> getProviderReviews(Long providerId) {
        return reviewRepository.findByProviderIdOrderByCreatedAtDesc(providerId);
    }
}
