package com.serviqza.repository;

import com.serviqza.model.FuelRequest;
import com.serviqza.model.FuelStatus;
import com.serviqza.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FuelRequestRepository extends JpaRepository<FuelRequest, Long> {
    List<FuelRequest> findByRequesterOrderByCreatedAtDesc(User requester);
    List<FuelRequest> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);
    List<FuelRequest> findByAssignedHelperOrderByCreatedAtDesc(User helper);
    List<FuelRequest> findByAssignedHelperIdOrderByCreatedAtDesc(Long helperId);
    List<FuelRequest> findByStatus(FuelStatus status);

    @Modifying
    @Query("UPDATE FuelRequest f SET f.status = com.serviqza.model.FuelStatus.ACCEPTED, " +
           "f.assignedHelper = :helper, f.acceptedAt = :now " +
           "WHERE f.id = :requestId AND f.status = com.serviqza.model.FuelStatus.PENDING")
    int atomicallyAcceptFuelRequest(@Param("requestId") Long requestId,
                                   @Param("helper") User helper,
                                   @Param("now") LocalDateTime now);
}
