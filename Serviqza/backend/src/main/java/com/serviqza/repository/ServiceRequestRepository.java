package com.serviqza.repository;

import com.serviqza.model.RequestStatus;
import com.serviqza.model.ServiceProviderProfile;
import com.serviqza.model.ServiceRequest;
import com.serviqza.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findByCustomerOrderByCreatedAtDesc(User customer);
    List<ServiceRequest> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<ServiceRequest> findByProviderOrderByCreatedAtDesc(ServiceProviderProfile provider);
    List<ServiceRequest> findByProviderIdOrderByCreatedAtDesc(Long providerId);
    List<ServiceRequest> findByStatus(RequestStatus status);
}
