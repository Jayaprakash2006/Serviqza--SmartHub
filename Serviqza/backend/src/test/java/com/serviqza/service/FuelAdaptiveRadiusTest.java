package com.serviqza.service;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class FuelAdaptiveRadiusTest {

    @Test
    public void testAdaptiveRadiusProgression() {
        FuelAssistanceService service = new FuelAssistanceService(null, null, null, null);

        // Immediate creation (0-2 mins): radius should be 3.0 km
        LocalDateTime now = LocalDateTime.now();
        assertEquals(3.0, service.getAdaptiveRadiusKm(now), 0.01);

        // Created 1 minute ago (< 2 mins): still 3.0 km
        LocalDateTime oneMinAgo = now.minusMinutes(1);
        assertEquals(3.0, service.getAdaptiveRadiusKm(oneMinAgo), 0.01);

        // Created 3 minutes ago (2-5 mins): expands to 5.0 km
        LocalDateTime threeMinsAgo = now.minusMinutes(3);
        assertEquals(5.0, service.getAdaptiveRadiusKm(threeMinsAgo), 0.01);

        // Created 6 minutes ago (5+ mins): expands to 10.0 km
        LocalDateTime sixMinsAgo = now.minusMinutes(6);
        assertEquals(10.0, service.getAdaptiveRadiusKm(sixMinsAgo), 0.01);

        // Created 60 minutes ago (hard cap at 10.0 km)
        LocalDateTime hourAgo = now.minusHours(1);
        assertEquals(10.0, service.getAdaptiveRadiusKm(hourAgo), 0.01);
    }
}
