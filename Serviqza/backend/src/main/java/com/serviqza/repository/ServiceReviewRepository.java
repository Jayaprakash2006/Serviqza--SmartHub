package com.serviqza.repository;

import com.serviqza.model.ServiceProviderProfile;
import com.serviqza.model.ServiceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceReviewRepository extends JpaRepository<ServiceReview, Long> {
    Optional<ServiceReview> findByServiceRequestId(Long serviceRequestId);
    boolean existsByServiceRequestId(Long serviceRequestId);
    List<ServiceReview> findByProvider(ServiceProviderProfile provider);
    List<ServiceReview> findByProviderIdOrderByCreatedAtDesc(Long providerId);

    @Query("SELECT AVG(r.rating) FROM ServiceReview r WHERE r.provider.id = :providerId")
    Double calculateAverageRating(@Param("providerId") Long providerId);

    @Query("SELECT COUNT(r) FROM ServiceReview r WHERE r.provider.id = :providerId")
    Integer countByProviderId(@Param("providerId") Long providerId);
}
