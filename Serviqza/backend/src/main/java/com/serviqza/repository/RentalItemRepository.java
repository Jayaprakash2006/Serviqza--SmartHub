package com.serviqza.repository;

import com.serviqza.model.RentalItem;
import com.serviqza.model.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RentalItemRepository extends JpaRepository<RentalItem, Long> {
    List<RentalItem> findByOwner(User owner);
    List<RentalItem> findByOwnerId(Long ownerId);
    List<RentalItem> findByAvailabilityTrue();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM RentalItem r WHERE r.id = :id")
    Optional<RentalItem> findByIdForUpdate(@Param("id") Long id);

    @Query("SELECT r FROM RentalItem r WHERE r.availability = true " +
           "AND (:category IS NULL OR LOWER(r.category) = LOWER(:category)) " +
           "AND (:keyword IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(r.location) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<RentalItem> searchRentals(@Param("category") String category, @Param("keyword") String keyword);
}
