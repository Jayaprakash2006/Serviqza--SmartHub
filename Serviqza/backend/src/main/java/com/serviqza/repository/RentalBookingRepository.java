package com.serviqza.repository;

import com.serviqza.model.BookingStatus;
import com.serviqza.model.RentalBooking;
import com.serviqza.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RentalBookingRepository extends JpaRepository<RentalBooking, Long> {
    List<RentalBooking> findByCustomerOrderByCreatedAtDesc(User customer);
    List<RentalBooking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<RentalBooking> findByItemIdOrderByStartDateAsc(Long itemId);
    List<RentalBooking> findByItemOwnerIdOrderByCreatedAtDesc(Long ownerId);

    @Query("SELECT COUNT(b) FROM RentalBooking b WHERE b.item.id = :itemId " +
           "AND b.status = com.serviqza.model.BookingStatus.CONFIRMED " +
           "AND (:startDate < b.endDate AND :endDate > b.startDate)")
    long countOverlappingBookings(@Param("itemId") Long itemId,
                                 @Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate);
}
