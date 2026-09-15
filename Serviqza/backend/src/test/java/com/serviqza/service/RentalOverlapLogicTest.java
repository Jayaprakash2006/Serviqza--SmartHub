package com.serviqza.service;

import org.junit.jupiter.api.Test;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class RentalOverlapLogicTest {

    private boolean isOverlapping(LocalDate newStart, LocalDate newEnd, LocalDate existingStart, LocalDate existingEnd) {
        return newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart);
    }

    @Test
    public void testOverlappingBookings() {
        LocalDate existingStart = LocalDate.of(2026, 10, 10);
        LocalDate existingEnd = LocalDate.of(2026, 10, 15);

        // Exact same dates: overlaps
        assertTrue(isOverlapping(LocalDate.of(2026, 10, 10), LocalDate.of(2026, 10, 15), existingStart, existingEnd));

        // Sub-range: inside existing dates: overlaps
        assertTrue(isOverlapping(LocalDate.of(2026, 10, 11), LocalDate.of(2026, 10, 14), existingStart, existingEnd));

        // Overlapping at the beginning
        assertTrue(isOverlapping(LocalDate.of(2026, 10, 8), LocalDate.of(2026, 10, 12), existingStart, existingEnd));

        // Overlapping at the end
        assertTrue(isOverlapping(LocalDate.of(2026, 10, 13), LocalDate.of(2026, 10, 18), existingStart, existingEnd));

        // Encompassing the entire range
        assertTrue(isOverlapping(LocalDate.of(2026, 10, 5), LocalDate.of(2026, 10, 20), existingStart, existingEnd));

        // Completely before: does NOT overlap
        assertFalse(isOverlapping(LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 10), existingStart, existingEnd));

        // Completely after: does NOT overlap
        assertFalse(isOverlapping(LocalDate.of(2026, 10, 15), LocalDate.of(2026, 10, 20), existingStart, existingEnd));
    }
}
