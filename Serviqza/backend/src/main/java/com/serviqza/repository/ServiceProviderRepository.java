package com.serviqza.repository;

import com.serviqza.model.ServiceProviderProfile;
import com.serviqza.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceProviderRepository extends JpaRepository<ServiceProviderProfile, Long> {
    Optional<ServiceProviderProfile> findByUser(User user);
    Optional<ServiceProviderProfile> findByUserId(Long userId);
    List<ServiceProviderProfile> findByAvailableTrue();
}
