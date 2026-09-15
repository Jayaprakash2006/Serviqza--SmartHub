package com.serviqza.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class HaversineUtilTest {

    @Test
    public void testDistanceBetweenSamePointsIsZero() {
        double dist = HaversineUtil.calculateDistance(12.9716, 77.5946, 12.9716, 77.5946);
        assertEquals(0.0, dist, 0.01);
    }

    @Test
    public void testDistanceWithinFewKilometers() {
        // Points ~1.2 km apart in Bangalore
        double lat1 = 12.9716;
        double lon1 = 77.5946;
        double lat2 = 12.9780;
        double lon2 = 77.6000;

        double dist = HaversineUtil.calculateDistance(lat1, lon1, lat2, lon2);
        assertTrue(dist > 0.8 && dist < 1.5, "Distance should be around 1.0 km, got: " + dist);
    }

    @Test
    public void testDistanceExceedingTenKm() {
        // Customer point and Far helper point
        double lat1 = 12.9716;
        double lon1 = 77.5946;
        double lat2 = 13.1100;
        double lon2 = 77.6200;

        double dist = HaversineUtil.calculateDistance(lat1, lon1, lat2, lon2);
        assertTrue(dist > 14.0, "Far distance should be over 14 km, got: " + dist);
    }
}
