package com.serviqza.controller;

import com.serviqza.dto.*;
import com.serviqza.model.FuelReview;
import com.serviqza.service.FuelAssistanceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fuel")
public class FuelController {

    private final FuelAssistanceService fuelService;

    public FuelController(FuelAssistanceService fuelService) {
        this.fuelService = fuelService;
    }

    @PostMapping("/requests")
    public ResponseEntity<FuelRequestResponse> createFuelRequest(@Valid @RequestBody CreateFuelRequest request) {
        return ResponseEntity.ok(fuelService.createFuelRequest(request));
    }

    @GetMapping("/requests/my")
    public ResponseEntity<List<FuelRequestResponse>> getMyRequests() {
        return ResponseEntity.ok(fuelService.getMyFuelRequests());
    }

    @GetMapping("/requests/nearby")
    public ResponseEntity<List<FuelRequestResponse>> getNearbyRequests() {
        return ResponseEntity.ok(fuelService.getNearbyFuelRequests());
    }

    @GetMapping("/requests/accepted")
    public ResponseEntity<List<FuelRequestResponse>> getMyAcceptedRequests() {
        return ResponseEntity.ok(fuelService.getMyAcceptedFuelRequests());
    }

    @GetMapping("/requests/{id}")
    public ResponseEntity<FuelRequestResponse> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(fuelService.getFuelRequestById(id));
    }

    @PostMapping("/requests/{id}/accept")
    public ResponseEntity<FuelRequestResponse> acceptFuelRequest(@PathVariable Long id) {
        return ResponseEntity.ok(fuelService.acceptFuelRequest(id));
    }

    @PutMapping("/requests/{id}/status")
    public ResponseEntity<FuelRequestResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateFuelStatusRequest request) {
        return ResponseEntity.ok(fuelService.updateFuelRequestStatus(id, request));
    }

    @PutMapping("/requests/{id}/cancel")
    public ResponseEntity<FuelRequestResponse> cancelRequest(@PathVariable Long id) {
        return ResponseEntity.ok(fuelService.cancelFuelRequest(id));
    }

    @PostMapping("/requests/{id}/rating")
    public ResponseEntity<FuelReview> submitRating(
            @PathVariable Long id,
            @Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.ok(fuelService.submitFuelReview(id, request));
    }

    @PutMapping("/helper-mode")
    public ResponseEntity<Map<String, String>> toggleHelperMode(@Valid @RequestBody HelperModeRequest request) {
        fuelService.toggleHelperMode(request);
        return ResponseEntity.ok(Map.of("message", "Helper mode updated successfully"));
    }

    @PutMapping("/helper-location")
    public ResponseEntity<Map<String, String>> updateHelperLocation(@Valid @RequestBody HelperLocationRequest request) {
        fuelService.updateHelperLocation(request);
        return ResponseEntity.ok(Map.of("message", "Helper location updated successfully"));
    }
}
