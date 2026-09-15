package com.serviqza.service;

import com.serviqza.dto.CreateRentalBookingRequest;
import com.serviqza.dto.CreateRentalItemRequest;
import com.serviqza.exception.BadRequestException;
import com.serviqza.exception.ConflictException;
import com.serviqza.exception.ResourceNotFoundException;
import com.serviqza.model.BookingStatus;
import com.serviqza.model.RentalBooking;
import com.serviqza.model.RentalItem;
import com.serviqza.model.Role;
import com.serviqza.model.User;
import com.serviqza.repository.RentalBookingRepository;
import com.serviqza.repository.RentalItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class RentalService {

    private final RentalItemRepository rentalItemRepository;
    private final RentalBookingRepository bookingRepository;
    private final AuthService authService;

    public RentalService(RentalItemRepository rentalItemRepository,
                         RentalBookingRepository bookingRepository,
                         AuthService authService) {
        this.rentalItemRepository = rentalItemRepository;
        this.bookingRepository = bookingRepository;
        this.authService = authService;
    }

    public List<RentalItem> getAllAvailableItems() {
        return rentalItemRepository.findByAvailabilityTrue();
    }

    public List<RentalItem> searchRentals(String category, String keyword) {
        return rentalItemRepository.searchRentals(category, keyword);
    }

    public RentalItem getItemById(Long id) {
        return rentalItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rental item not found with ID: " + id));
    }

    public List<RentalItem> getMyRentalItems() {
        User owner = authService.getCurrentAuthenticatedUser();
        return rentalItemRepository.findByOwner(owner);
    }

    @Transactional
    public RentalItem createRentalItem(CreateRentalItemRequest request) {
        User owner = authService.getCurrentAuthenticatedUser();

        RentalItem item = new RentalItem(
                owner,
                request.getName(),
                request.getDescription(),
                request.getCategory(),
                request.getPricePerDay(),
                request.getLocation(),
                request.getLatitude(),
                request.getLongitude(),
                request.getImageUrl()
        );

        return rentalItemRepository.save(item);
    }

    @Transactional
    public RentalItem updateRentalItem(Long id, CreateRentalItemRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        RentalItem item = getItemById(id);

        if (!item.getOwner().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new BadRequestException("You do not have permission to update this rental item");
        }

        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setPricePerDay(request.getPricePerDay());
        item.setLocation(request.getLocation());
        item.setLatitude(request.getLatitude());
        item.setLongitude(request.getLongitude());
        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            item.setImageUrl(request.getImageUrl());
        }

        return rentalItemRepository.save(item);
    }

    @Transactional
    public void deleteRentalItem(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        RentalItem item = getItemById(id);

        if (!item.getOwner().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new BadRequestException("You do not have permission to delete this rental item");
        }

        rentalItemRepository.delete(item);
    }

    /**
     * Creates a rental booking with concurrency & overlap protection.
     * Uses PESSIMISTIC_WRITE lock on the RentalItem to ensure safe serialization of concurrent booking requests.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public RentalBooking bookRentalItem(CreateRentalBookingRequest request) {
        User customer = authService.getCurrentAuthenticatedUser();

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date must be on or after start date");
        }

        // Lock item pessimistically to prevent concurrent transactions from double-booking
        RentalItem item = rentalItemRepository.findByIdForUpdate(request.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Rental item not found with ID: " + request.getItemId()));

        if (!item.isAvailability()) {
            throw new BadRequestException("This rental item is currently marked unavailable");
        }

        if (item.getOwner().getId().equals(customer.getId())) {
            throw new BadRequestException("You cannot book your own rental item");
        }

        // Overlap Condition: newStart < existingEnd AND newEnd > existingStart
        long overlappingCount = bookingRepository.countOverlappingBookings(
                item.getId(),
                request.getStartDate(),
                request.getEndDate()
        );

        if (overlappingCount > 0) {
            throw new ConflictException("The selected dates (" + request.getStartDate() + " to " +
                    request.getEndDate() + ") conflict with an existing confirmed booking for this item.");
        }

        long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        double totalPrice = days * item.getPricePerDay();

        RentalBooking booking = new RentalBooking(
                item,
                customer,
                request.getStartDate(),
                request.getEndDate(),
                totalPrice,
                BookingStatus.CONFIRMED
        );

        return bookingRepository.save(booking);
    }

    public List<RentalBooking> getMyBookings() {
        User customer = authService.getCurrentAuthenticatedUser();
        return bookingRepository.findByCustomerOrderByCreatedAtDesc(customer);
    }

    public List<RentalBooking> getOwnerBookings() {
        User owner = authService.getCurrentAuthenticatedUser();
        return bookingRepository.findByItemOwnerIdOrderByCreatedAtDesc(owner.getId());
    }

    public List<RentalBooking> getItemBookings(Long itemId) {
        return bookingRepository.findByItemIdOrderByStartDateAsc(itemId);
    }

    @Transactional
    public RentalBooking cancelBooking(Long bookingId) {
        User user = authService.getCurrentAuthenticatedUser();
        RentalBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        boolean isCustomer = booking.getCustomer().getId().equals(user.getId());
        boolean isOwner = booking.getItem().getOwner().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;

        if (!isCustomer && !isOwner && !isAdmin) {
            throw new BadRequestException("Not authorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }
}
