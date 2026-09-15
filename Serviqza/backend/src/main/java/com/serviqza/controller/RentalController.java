package com.serviqza.controller;

import com.serviqza.dto.CreateRentalBookingRequest;
import com.serviqza.dto.CreateRentalItemRequest;
import com.serviqza.model.RentalBooking;
import com.serviqza.model.RentalItem;
import com.serviqza.service.RentalService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RentalController {

    private final RentalService rentalService;

    public RentalController(RentalService rentalService) {
        this.rentalService = rentalService;
    }

    @GetMapping("/rentals")
    public ResponseEntity<List<RentalItem>> getRentals(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(rentalService.searchRentals(category, keyword));
    }

    @GetMapping("/rentals/{id}")
    public ResponseEntity<RentalItem> getRentalItem(@PathVariable Long id) {
        return ResponseEntity.ok(rentalService.getItemById(id));
    }

    @GetMapping("/rentals/{id}/bookings")
    public ResponseEntity<List<RentalBooking>> getItemBookings(@PathVariable Long id) {
        return ResponseEntity.ok(rentalService.getItemBookings(id));
    }

    @PostMapping("/rentals")
    public ResponseEntity<RentalItem> createRentalItem(@Valid @RequestBody CreateRentalItemRequest request) {
        return ResponseEntity.ok(rentalService.createRentalItem(request));
    }

    @PutMapping("/rentals/{id}")
    public ResponseEntity<RentalItem> updateRentalItem(
            @PathVariable Long id,
            @Valid @RequestBody CreateRentalItemRequest request) {
        return ResponseEntity.ok(rentalService.updateRentalItem(id, request));
    }

    @DeleteMapping("/rentals/{id}")
    public ResponseEntity<Void> deleteRentalItem(@PathVariable Long id) {
        rentalService.deleteRentalItem(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/rental-bookings")
    public ResponseEntity<RentalBooking> bookRentalItem(@Valid @RequestBody CreateRentalBookingRequest request) {
        return ResponseEntity.ok(rentalService.bookRentalItem(request));
    }

    @GetMapping("/rental-bookings/my")
    public ResponseEntity<List<RentalBooking>> getMyBookings() {
        return ResponseEntity.ok(rentalService.getMyBookings());
    }

    @GetMapping("/rental-bookings/owner")
    public ResponseEntity<List<RentalBooking>> getOwnerBookings() {
        return ResponseEntity.ok(rentalService.getOwnerBookings());
    }

    @PutMapping("/rental-bookings/{id}/cancel")
    public ResponseEntity<RentalBooking> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(rentalService.cancelBooking(id));
    }
}
