# Serviqza – Local Service, Rental and Emergency Assistance Platform

Serviqza is a full-stack, location-aware platform designed to solve urban and roadside emergency challenges. Customers can find verified local service providers, rent industrial and household equipment with zero double-booking concurrency guarantees, and broadcast emergency fuel requests matched dynamically to nearby eligible community helpers.

---

## 🌟 Key Innovations & Technical Highlights

### 1. Emergency Roadside Fuel Assistance with Adaptive Radius
* **Haversine Distance**: Uses the spherical Haversine formula on latitude and longitude coordinates to evaluate exact geographical proximity in kilometers.
* **Adaptive Radius Progression**:
  * **0 – 2 minutes**: Searches strictly within **3 km**.
  * **2 – 5 minutes**: Automatically expands matching radius to **5 km**.
  * **5+ minutes**: Expands to a maximum cap of **10 km**.
* **Strict Eligibility Criteria**: Only helpers who are logged in, have helper mode enabled, are marked available, have reported recent coordinates, and are within the current radius can see or receive the request.
* **Atomic Single-Winner Acceptance**: When multiple helpers simultaneously attempt to accept the same pending fuel request, a database-level atomic conditional query guarantees that exactly **one** helper wins (`200 OK`). All other concurrent helpers are rejected with `409 Conflict`.

### 2. Concurrency-Safe Equipment Rental
* **Interval Overlap Condition**: Enforces `newStart < existingEnd AND newEnd > existingStart` for all active bookings.
* **Pessimistic Locking**: `findByIdForUpdate` applies a database-level `SELECT ... FOR UPDATE` lock on the rental equipment record during the transaction, preventing race conditions from simultaneous booking submissions.

### 3. Local Services Marketplace
* Database-driven service categories (Vehicle Service, Plumbing, Electrical, AC Repair, Laptop Repair, Carpentry, Cleaning).
* Lifecycle status machine: `PENDING` ➔ `ACCEPTED` ➔ `ON_THE_WAY` ➔ `ARRIVED` ➔ `IN_PROGRESS` ➔ `COMPLETED` / `CANCELLED`.
* Verified reviews and dynamic average rating calculations.

### 4. Admin Oversight Dashboard
* System statistics (Total Users, Providers, Rental Fleet, Service Requests, Bookings, Fuel Emergencies, Active Helpers).
* One-click user suspension/activation controls and full audit trails.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Java 21 / 25, Spring Boot 3.4.3, Spring Web, Spring Data JPA, Spring Security 6, JJWT 0.12.6, Bean Validation |
| **Database** | MySQL 8.0 (`serviqza_db`) |
| **Frontend** | React 19, Vite, React Router v7, Axios, Lucide React, Modern CSS Design System |
| **Location Engine**| Haversine Spherical Formula, Browser Geolocation API, Built-in Coordinates Simulator |
| **Build Tools** | Apache Maven 3.9.9, Node.js & npm |

---

## 📁 Project Structure

```text
Serviqza/
├── backend/
│   ├── src/main/java/com/serviqza/
│   │   ├── config/             # Security & CORS configuration
│   │   ├── controller/         # REST Controllers (Auth, Service, Rental, Fuel, Admin)
│   │   ├── dto/                # Request and response transfer objects
│   │   ├── exception/          # GlobalExceptionHandler, ResourceNotFound, ConflictException
│   │   ├── model/              # JPA Entities (User, ServiceListing, RentalItem, FuelRequest...)
│   │   ├── repository/         # Spring Data JPA repositories with atomic queries & locking
│   │   ├── security/           # JWT Utils, AuthTokenFilter, UserDetails
│   │   ├── service/            # Core business logic & DataSeedService
│   │   ├── util/               # HaversineUtil spherical formula
│   │   └── ServiqzaApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── src/test/java/          # Unit tests (Haversine, Adaptive Radius, Overlap logic)
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── api/client.js       # Centralized Axios client with JWT interceptors
│   │   ├── components/         # Navbar, LocationBar simulator
│   │   ├── context/            # AuthContext (roles, helper mode, GPS coordinates)
│   │   ├── pages/              # Home, Login, Register, Services, Rentals, Fuel, Helper, Provider, Admin
│   │   ├── App.jsx             # React Router structure
│   │   └── index.css           # Responsive design system
│   └── package.json
├── test-e2e.js                 # Complete backend integration test suite
└── README.md
```

---

## 🔑 Demo Accounts (Pre-Seeded)

All demo accounts share the password: `password123`

| Role | Name | Email | Coordinates / Location | Description |
|---|---|---|---|---|
| **ADMIN** | System Admin | `admin@serviqza.com` | Central | Platform oversight and user management |
| **CUSTOMER** | Alice Green | `alice@example.com` | `12.9716, 77.5946` (MG Road) | Customer seeking emergency fuel and services |
| **CUSTOMER** | Bob Smith | `bob@example.com` | `12.9750, 77.6000` | Secondary demo customer |
| **PROVIDER** | Rajesh Kumar | `rajesh.mechanic@serviqza.com` | `12.9720, 77.5950` | Auto Mechanic (Roadside Diagnostic, Jumpstart) |
| **PROVIDER** | David Miller | `david.plumber@serviqza.com` | `12.9780, 77.6020` | Apex Quick Plumbers |
| **RENTAL_OWNER** | Mark Johnson | `mark.rentals@serviqza.com` | `12.9784, 77.6408` | Owner of Generators, Washers, Drills, Ladders |
| **COMMUNITY_HELPER**| Carlos Santana | `carlos.helper@serviqza.com` | `12.9780, 77.6000` (~1 km) | **Near Helper** (Matches within 3 km) |
| **COMMUNITY_HELPER**| Priya Patel | `priya.helper@serviqza.com` | `12.9400, 77.5800` (~4.5 km) | **Mid Helper** (Matches in 5 km expansion) |
| **COMMUNITY_HELPER**| Frank Wright | `frank.helper@serviqza.com` | `13.1100, 77.6200` (~18 km) | **Far Helper** (Outside 10 km max radius) |

> ⚡ **Tip**: The Login page features **1-click login buttons** for all demo personas.

---

## 🚀 How to Run Locally

### 1. Prerequisites
* MySQL Server running on `localhost:3306`
* Java 17+ (Java 21/25 installed)
* Node.js & npm

### 2. Database Setup
In MySQL, create the database:
```sql
CREATE DATABASE IF NOT EXISTS serviqza_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Start Backend
From the project root:
```bash
cd backend
mvn spring-boot:run
```
*(Or use `..\mvn.cmd spring-boot:run`)*  
The backend will automatically start Tomcat on `http://localhost:8080` and seed initial demo data on first launch.

### 4. Start Frontend
From the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Testing

### Automated Unit Tests
Run backend unit tests verifying Haversine calculations, adaptive radius, and rental overlap algorithms:
```bash
cd backend
mvn test
```

### Comprehensive End-to-End Integration Suite
Run the automated end-to-end integration test runner:
```bash
node test-e2e.js
```
This script exercises:
* User authentication across all 5 roles
* Service marketplace booking, provider lifecycle transitions, and 5-star customer review
* Equipment booking with concurrency conflict detection (verifying `409 Conflict` on overlap)
* Emergency fuel request creation, Haversine matching within 3 km, rejection of far helpers (>10 km)
* Concurrent multi-helper atomic acceptance race (confirming 1 winner and 1 conflict rejection)
* Status tracking to completion and helper rating

---

## 📐 Algorithmic Details

### 1. Haversine Spherical Distance Formula
```java
public static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    double dLat = Math.toRadians(lat2 - lat1);
    double dLon = Math.toRadians(lon2 - lon1);
    double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.sin(dLon / 2) * Math.sin(dLon / 2) 
            * Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2));
    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round((6371.0 * c) * 100.0) / 100.0;
}
```

### 2. Atomic Single-Winner Fuel Acceptance
```sql
UPDATE fuel_requests 
SET status = 'ACCEPTED', assigned_helper_id = :helperId, accepted_at = :now 
WHERE id = :id AND status = 'PENDING';
```
If `rowsAffected == 0`, the request was already won by another helper; the service throws `ConflictException` which maps to HTTP `409 Conflict`.

### 3. Rental Overlap Check
```sql
SELECT COUNT(b) FROM RentalBooking b 
WHERE b.item.id = :itemId 
  AND b.status = 'CONFIRMED' 
  AND (:startDate < b.endDate AND :endDate > b.startDate);
```
Combined with `@Lock(LockModeType.PESSIMISTIC_WRITE)`, double booking is impossible even under high concurrency.
