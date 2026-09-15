package com.serviqza.repository;

import com.serviqza.model.ServiceCategory;
import com.serviqza.model.ServiceListing;
import com.serviqza.model.ServiceProviderProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceListingRepository extends JpaRepository<ServiceListing, Long> {
    List<ServiceListing> findByProvider(ServiceProviderProfile provider);
    List<ServiceListing> findByProviderId(Long providerId);
    List<ServiceListing> findByCategoryAndActiveTrue(ServiceCategory category);
    List<ServiceListing> findByActiveTrue();

    @Query("SELECT s FROM ServiceListing s WHERE s.active = true " +
           "AND (:categoryId IS NULL OR s.category.id = :categoryId) " +
           "AND (:keyword IS NULL OR LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(s.provider.businessName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<ServiceListing> searchServices(@Param("categoryId") Long categoryId, @Param("keyword") String keyword);
}
