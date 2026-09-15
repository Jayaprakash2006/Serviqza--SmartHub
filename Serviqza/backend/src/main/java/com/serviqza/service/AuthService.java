package com.serviqza.service;

import com.serviqza.dto.AuthResponse;
import com.serviqza.dto.LoginRequest;
import com.serviqza.dto.RegisterRequest;
import com.serviqza.exception.BadRequestException;
import com.serviqza.exception.ResourceNotFoundException;
import com.serviqza.model.Role;
import com.serviqza.model.ServiceProviderProfile;
import com.serviqza.model.User;
import com.serviqza.repository.ServiceProviderRepository;
import com.serviqza.repository.UserRepository;
import com.serviqza.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ServiceProviderRepository providerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository,
                       ServiceProviderRepository providerRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.providerRepository = providerRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Error: Email is already registered!");
        }

        User user = new User(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getPhone(),
                request.getRole()
        );

        User savedUser = userRepository.save(user);

        // If user registered as PROVIDER, create default provider profile
        if (savedUser.getRole() == Role.PROVIDER) {
            ServiceProviderProfile profile = new ServiceProviderProfile(
                    savedUser,
                    savedUser.getName() + " Services",
                    2,
                    "Experienced service provider offering high quality local assistance.",
                    "Metro Area",
                    12.9716,
                    77.5946
            );
            providerRepository.save(profile);
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtUtils.generateJwtToken(authentication);

        return new AuthResponse(
                jwt,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getPhone(),
                savedUser.isHelperModeActive(),
                savedUser.isAvailable(),
                savedUser.getCurrentLatitude(),
                savedUser.getCurrentLongitude()
        );
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtUtils.generateJwtToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getPhone(),
                user.isHelperModeActive(),
                user.isAvailable(),
                user.getCurrentLatitude(),
                user.getCurrentLongitude()
        );
    }

    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("User is not authenticated");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }
}
