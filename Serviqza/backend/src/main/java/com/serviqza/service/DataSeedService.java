package com.serviqza.service;

import com.serviqza.model.*;
import com.serviqza.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DataSeedService implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeedService.class);

    private final UserRepository userRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final ServiceProviderRepository providerRepository;
    private final ServiceListingRepository listingRepository;
    private final RentalItemRepository rentalItemRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeedService(UserRepository userRepository,
                           ServiceCategoryRepository categoryRepository,
                           ServiceProviderRepository providerRepository,
                           ServiceListingRepository listingRepository,
                           RentalItemRepository rentalItemRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.providerRepository = providerRepository;
        this.listingRepository = listingRepository;
        this.rentalItemRepository = rentalItemRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            logger.info("Database already contains records. Skipping seed data.");
            return;
        }

        logger.info("Seeding initial data for Serviqza MVP...");

        String defaultPassword = passwordEncoder.encode("password123");

        // 1. Admin
        User admin = new User("System Admin", "admin@serviqza.com", defaultPassword, "+1-555-0100", Role.ADMIN);
        userRepository.save(admin);

        // 2. Customers
        User customer1 = new User("Alice Green", "alice@example.com", defaultPassword, "+1-555-0101", Role.CUSTOMER);
        customer1.setCurrentLatitude(12.9716);
        customer1.setCurrentLongitude(77.5946);
        userRepository.save(customer1);

        User customer2 = new User("Bob Smith", "bob@example.com", defaultPassword, "+1-555-0102", Role.CUSTOMER);
        customer2.setCurrentLatitude(12.9750);
        customer2.setCurrentLongitude(77.6000);
        userRepository.save(customer2);

        // 3. Service Categories
        ServiceCategory catVehicle = categoryRepository.save(new ServiceCategory("Vehicle Service", "Emergency towing, puncture, and mechanic assistance", "Wrench"));
        ServiceCategory catPlumbing = categoryRepository.save(new ServiceCategory("Plumbing", "Leak repairs, pipe installations, drain cleaning", "Droplet"));
        ServiceCategory catElectrical = categoryRepository.save(new ServiceCategory("Electrical", "Wiring, short circuit fixes, appliance power setup", "Zap"));
        ServiceCategory catAC = categoryRepository.save(new ServiceCategory("AC Repair", "HVAC servicing, gas refilling, and diagnostics", "Wind"));
        ServiceCategory catLaptop = categoryRepository.save(new ServiceCategory("Computer/Laptop Repair", "Hardware replacement, OS installation, malware removal", "Laptop"));
        ServiceCategory catCarpentry = categoryRepository.save(new ServiceCategory("Carpentry", "Furniture assembly, door fixing, custom woodwork", "Hammer"));
        ServiceCategory catCleaning = categoryRepository.save(new ServiceCategory("Cleaning", "Deep home sanitization, kitchen, and bathroom care", "Sparkles"));

        // 4. Providers & Listings
        User provUser1 = userRepository.save(new User("Rajesh Kumar", "rajesh.mechanic@serviqza.com", defaultPassword, "+1-555-0201", Role.PROVIDER));
        ServiceProviderProfile prof1 = providerRepository.save(new ServiceProviderProfile(
                provUser1, "Rajesh Auto Care", 8,
                "Certified multi-brand mechanic specializing in roadside emergency repair.",
                "Central & South District", 12.9720, 77.5950
        ));
        listingRepository.save(new ServiceListing(prof1, catVehicle, "Roadside Diagnostic & Jumpstart", "Comprehensive battery jumpstart and engine diagnostic at your location", 45.0));
        listingRepository.save(new ServiceListing(prof1, catVehicle, "Tire Puncture & Replacement", "Instant flat tire plug repair or spare wheel fitment", 30.0));

        User provUser2 = userRepository.save(new User("David Miller", "david.plumber@serviqza.com", defaultPassword, "+1-555-0202", Role.PROVIDER));
        ServiceProviderProfile prof2 = providerRepository.save(new ServiceProviderProfile(
                provUser2, "Apex Quick Plumbers", 5,
                "Prompt 24/7 plumbing assistance for residential and commercial spaces.",
                "Downtown & Metro", 12.9780, 77.6020
        ));
        listingRepository.save(new ServiceListing(prof2, catPlumbing, "Emergency Pipe Leak Repair", "High-pressure pipe leak isolation and clamp fitting", 40.0));
        listingRepository.save(new ServiceListing(prof2, catPlumbing, "Drain Unclogging", "Hydro-jet clearing of blocked sinks, toilets and mains", 50.0));

        User provUser3 = userRepository.save(new User("Vikram Sharma", "vikram.electric@serviqza.com", defaultPassword, "+1-555-0203", Role.PROVIDER));
        ServiceProviderProfile prof3 = providerRepository.save(new ServiceProviderProfile(
                provUser3, "VoltMaster Electricals", 7,
                "Master electrician for residential switches, fuse boxes and earthing.",
                "All Metropolitan Zones", 12.9690, 77.5890
        ));
        listingRepository.save(new ServiceListing(prof3, catElectrical, "Short Circuit Tripping Diagnosis", "Trace shorted conductors and replace faulty MCB breakers", 55.0));

        User provUser4 = userRepository.save(new User("Sarah Jenkins", "sarah.ac@serviqza.com", defaultPassword, "+1-555-0204", Role.PROVIDER));
        ServiceProviderProfile prof4 = providerRepository.save(new ServiceProviderProfile(
                provUser4, "ChillTech Cooling", 6,
                "Cooling specialists for split, window and central AC maintenance.",
                "North & East Zones", 12.9850, 77.6100
        ));
        listingRepository.save(new ServiceListing(prof4, catAC, "AC Full Service & Gas Refill", "Coil cleaning, filter sanitization and refrigerant top-up", 65.0));

        // 5. Rental Owner & Items
        User rentalOwner = userRepository.save(new User("Mark Johnson", "mark.rentals@serviqza.com", defaultPassword, "+1-555-0301", Role.RENTAL_OWNER));

        rentalItemRepository.save(new RentalItem(
                rentalOwner, "Heavy-Duty Diesel Generator 5kVA",
                "Reliable continuous power backup generator with electric start and quiet muffler.",
                "Power & Electrical", 60.0, "Indiranagar Hub", 12.9784, 77.6408,
                "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=60"
        ));
        rentalItemRepository.save(new RentalItem(
                rentalOwner, "Commercial Pressure Washer 2500 PSI",
                "High performance electric pressure cleaner with 4 quick-connect spray tips.",
                "Cleaning & Maintenance", 25.0, "Koramangala Depot", 12.9352, 77.6245,
                "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=60"
        ));
        rentalItemRepository.save(new RentalItem(
                rentalOwner, "Rotary Hammer Drill Machine",
                "Powerful masonry impact drill with SDS-plus bits set included.",
                "Power Tools", 15.0, "MG Road Center", 12.9750, 77.6090,
                "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=60"
        ));
        rentalItemRepository.save(new RentalItem(
                rentalOwner, "Aluminum Telescopic Ladder 16ft",
                "Multi-position foldable extension ladder with anti-slip rubber pads.",
                "Construction & Tools", 12.0, "HSR Layout Station", 12.9121, 77.6446,
                "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&auto=format&fit=crop&q=60"
        ));
        rentalItemRepository.save(new RentalItem(
                rentalOwner, "Portable Inverter Welding Machine 200A",
                "Lightweight ARC welder with auto-darkening helmet and cables.",
                "Welding & Fabrication", 35.0, "Whitefield Depot", 12.9698, 77.7499,
                "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=60"
        ));

        // 6. Community Helpers (with active helper mode & coordinates)
        // Helper 1: ~1.2 km from customer (12.9716, 77.5946) -> Coordinates: 12.9780, 77.6000 (Within 3km initial radius)
        User helper1 = new User("Carlos Santana (Near Helper)", "carlos.helper@serviqza.com", defaultPassword, "+1-555-0401", Role.COMMUNITY_HELPER);
        helper1.setHelperModeActive(true);
        helper1.setAvailable(true);
        helper1.setCurrentLatitude(12.9780);
        helper1.setCurrentLongitude(77.6000);
        helper1.setLastLocationUpdate(LocalDateTime.now());
        helper1.setHelperRating(4.9);
        helper1.setHelperRatingCount(18);
        userRepository.save(helper1);

        // Helper 2: ~4.1 km from customer -> Coordinates: 12.9400, 77.5800 (Inside 5km radius, outside 3km)
        User helper2 = new User("Priya Patel (Mid Helper)", "priya.helper@serviqza.com", defaultPassword, "+1-555-0402", Role.COMMUNITY_HELPER);
        helper2.setHelperModeActive(true);
        helper2.setAvailable(true);
        helper2.setCurrentLatitude(12.9400);
        helper2.setCurrentLongitude(77.5800);
        helper2.setLastLocationUpdate(LocalDateTime.now());
        helper2.setHelperRating(4.8);
        helper2.setHelperRatingCount(12);
        userRepository.save(helper2);

        // Helper 3: ~18 km from customer (Far helper, outside 10km maximum radius)
        User helper3 = new User("Frank Wright (Far Helper)", "frank.helper@serviqza.com", defaultPassword, "+1-555-0403", Role.COMMUNITY_HELPER);
        helper3.setHelperModeActive(true);
        helper3.setAvailable(true);
        helper3.setCurrentLatitude(13.1100);
        helper3.setCurrentLongitude(77.6200);
        helper3.setLastLocationUpdate(LocalDateTime.now());
        helper3.setHelperRating(5.0);
        helper3.setHelperRatingCount(5);
        userRepository.save(helper3);

        logger.info("Seed data creation completed successfully!");
    }
}
