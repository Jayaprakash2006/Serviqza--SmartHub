package com.serviqza.controller;

import com.serviqza.dto.CreateReviewRequest;
import com.serviqza.dto.CreateServiceListingRequest;
import com.serviqza.dto.CreateServiceRequest;
import com.serviqza.dto.UpdateServiceStatusRequest;
import com.serviqza.model.*;
import com.serviqza.service.ServiceMarketplaceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ServiceMarketplaceController {

    private final ServiceMarketplaceService serviceMarketplaceService;

    public ServiceMarketplaceController(ServiceMarketplaceService serviceMarketplaceService) {
        this.serviceMarketplaceService = serviceMarketplaceService;
    }

    @GetMapping("/service-categories")
    public ResponseEntity<List<ServiceCategory>> getCategories() {
        return ResponseEntity.ok(serviceMarketplaceService.getAllCategories());
    }

    @GetMapping("/providers")
    public ResponseEntity<List<ServiceProviderProfile>> getProviders() {
        return ResponseEntity.ok(serviceMarketplaceService.getAllProviders());
    }

    @GetMapping("/providers/{id}")
    public ResponseEntity<ServiceProviderProfile> getProvider(@PathVariable Long id) {
        return ResponseEntity.ok(serviceMarketplaceService.getProviderById(id));
    }

    @GetMapping("/providers/{id}/reviews")
    public ResponseEntity<List<ServiceReview>> getProviderReviews(@PathVariable Long id) {
        return ResponseEntity.ok(serviceMarketplaceService.getProviderReviews(id));
    }

    @GetMapping("/services")
    public ResponseEntity<List<ServiceListing>> getServices(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(serviceMarketplaceService.searchServices(categoryId, keyword));
    }

    @GetMapping("/services/{id}")
    public ResponseEntity<ServiceListing> getService(@PathVariable Long id) {
        return ResponseEntity.ok(serviceMarketplaceService.getServiceById(id));
    }

    @PostMapping("/services")
    public ResponseEntity<ServiceListing> createService(@Valid @RequestBody CreateServiceListingRequest request) {
        return ResponseEntity.ok(serviceMarketplaceService.createServiceListing(request));
    }

    @PostMapping("/service-requests")
    public ResponseEntity<ServiceRequest> createServiceRequest(@Valid @RequestBody CreateServiceRequest request) {
        return ResponseEntity.ok(serviceMarketplaceService.createServiceRequest(request));
    }

    @GetMapping("/service-requests/my")
    public ResponseEntity<List<ServiceRequest>> getMyCustomerRequests() {
        return ResponseEntity.ok(serviceMarketplaceService.getMyCustomerRequests());
    }

    @GetMapping("/service-requests/provider")
    public ResponseEntity<List<ServiceRequest>> getMyProviderRequests() {
        return ResponseEntity.ok(serviceMarketplaceService.getMyProviderRequests());
    }

    @PutMapping("/service-requests/{id}/status")
    public ResponseEntity<ServiceRequest> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateServiceStatusRequest request) {
        return ResponseEntity.ok(serviceMarketplaceService.updateRequestStatus(id, request));
    }

    @PutMapping("/service-requests/{id}/cancel")
    public ResponseEntity<ServiceRequest> cancelRequest(@PathVariable Long id) {
        return ResponseEntity.ok(serviceMarketplaceService.cancelRequest(id));
    }

    @PostMapping("/service-requests/{id}/reviews")
    public ResponseEntity<ServiceReview> submitReview(
            @PathVariable Long id,
            @Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.ok(serviceMarketplaceService.submitReview(id, request));
    }
}
