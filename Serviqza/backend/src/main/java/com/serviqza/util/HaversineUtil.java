package com.serviqza.util;

public final class HaversineUtil {

    private static final double EARTH_RADIUS_KM = 6371.0;

    private HaversineUtil() {
    }

    /**
     * Calculates spherical distance between two geographic points using Haversine formula.
     *
     * @param lat1 Latitude of point 1 in decimal degrees
     * @param lon1 Longitude of point 1 in decimal degrees
     * @param lat2 Latitude of point 2 in decimal degrees
     * @param lon2 Longitude of point 2 in decimal degrees
     * @return Distance in kilometers
     */
    public static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double radLat1 = Math.toRadians(lat1);
        double radLat2 = Math.toRadians(lat2);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radLat1) * Math.cos(radLat2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return Math.round((EARTH_RADIUS_KM * c) * 100.0) / 100.0;
    }
}
