package com.serviqza.repository;

import com.serviqza.model.FuelReview;
import com.serviqza.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FuelReviewRepository extends JpaRepository<FuelReview, Long> {
    Optional<FuelReview> findByFuelRequestId(Long fuelRequestId);
    boolean existsByFuelRequestId(Long fuelRequestId);
    List<FuelReview> findByHelperOrderByCreatedAtDesc(User helper);

    @Query("SELECT AVG(r.rating) FROM FuelReview r WHERE r.helper.id = :helperId")
    Double calculateAverageRating(@Param("helperId") Long helperId);

    @Query("SELECT COUNT(r) FROM FuelReview r WHERE r.helper.id = :helperId")
    Integer countByHelperId(@Param("helperId") Long helperId);
}
