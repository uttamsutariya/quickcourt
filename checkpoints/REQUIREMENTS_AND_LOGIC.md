# QuickCourt - Requirements and Business Logic Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [User Roles](#user-roles)
3. [Authentication](#authentication)
4. [Time Slot Management](#time-slot-management)
5. [Booking System](#booking-system)
6. [Venue Management](#venue-management)
7. [Business Rules](#business-rules)
8. [Database Schema Decisions](#database-schema-decisions)
9. [Technical Stack](#technical-stack)

---

## Project Overview

QuickCourt is a sports facility booking platform that connects sports enthusiasts with local sports facilities. The platform enables:

- Facility owners to list and manage their sports venues
- Users to search, view, and book sports facilities
- Admins to oversee the platform and approve venues

### Core Business Model

- Facility owners can manage multiple venues
- Each venue can have multiple sports
- Each sport has its own courts
- Each court has independent time slot configurations
- Admin charges 10% commission on all bookings (configurable)

---

## User Roles

### 1. User (Customer)

- Can search and view approved venues
- Book available time slots
- Manage their bookings
- Cancel bookings (with restrictions)

### 2. Facility Owner

- Can add/edit multiple venues
- Manage courts for each venue
- Configure time slots per court
- View bookings for their facilities
- Mark courts as unavailable for maintenance/events

### 3. Admin

- Approve/reject venue registrations
- Manage all users
- Configure platform settings (commission, booking rules)
- View platform-wide statistics

---

## Authentication

### WorkOS Integration

- Authentication handled client-side using WorkOS AuthKit
- OTP verification managed by WorkOS
- User roles stored in both WorkOS metadata and MongoDB
- WorkOS user ID mapped to MongoDB user document

### User Profile Storage

```javascript
{
  workosId: string,      // WorkOS unique identifier
  email: string,
  name: string,
  avatarUrl: string,     // Optional
  role: enum,            // user/facility_owner/admin
  phoneNumber: string    // Optional
}
```

---

## Time Slot Management

### Core Concepts

#### 1. Court-Based Configuration

- Each court has **independent** slot configurations
- Time slots are configured **per weekday** (Monday to Sunday)
- Each day can have different settings

#### 2. Slot Configuration Structure

For each day of the week, a court has:

```javascript
{
  dayOfWeek: "monday",      // Day identifier
  isOpen: true,              // Whether court operates this day
  startTime: "09:00",        // Opening time (HH:MM format)
  slotDuration: 1,           // Duration in hours (1-4)
  numberOfSlots: 8,          // Total slots for the day
  price: 500                 // Price per slot (can override default)
}
```

#### 3. Slot Calculation Example

**Configuration:**

- Start Time: 9:00 AM
- Slot Duration: 1 hour
- Number of Slots: 8
- Based on the slot duration & No of slots, it can't exceed 24 hours (this should be handled at frontend and backend as well)

**Generated Slots:**

- 9:00 AM - 10:00 AM
- 10:00 AM - 11:00 AM
- 11:00 AM - 12:00 PM
- 12:00 PM - 1:00 PM
- 1:00 PM - 2:00 PM
- 2:00 PM - 3:00 PM
- 3:00 PM - 4:00 PM
- 4:00 PM - 5:00 PM

### Multi-Hour Bookings

- Users can book **consecutive slots** for extended play
- Example: If slots are 1-hour each, booking 3 consecutive slots = 3 hours
- System automatically marks all involved slots as unavailable

### Slot Duration Rules

- Only **whole hours** allowed (1, 2, 3, or 4 hours)
- No fractional hours (e.g., 1.5 hours not allowed)
- Different days can have different slot durations

---

## Booking System

### Booking Creation

1. User selects a court and date
2. System shows available slots for next 3 days
3. User can select single or multiple consecutive slots
4. System validates availability and operating hours
5. Payment is simulated (no actual payment gateway)
6. Booking is confirmed

### Booking Validation

Before confirming a booking, the system checks:

- Court is within operating hours
- Slot is not already booked
- Court is not marked unavailable (maintenance/events)
- Booking date is not in the past
- Booking is within allowed advance period (default: 7 days)

### Booking Status Flow

```
CONFIRMED → COMPLETED (after booking time passes)
    ↓
CANCELLED (if user cancels)
```

### Cancellation Rules

- Users can cancel **at least 2 hours** before booking time
- Cancellation reason can be provided
- Cancelled slots become available for others

### Conflict Prevention

- **Database-level uniqueness**: Partial unique index on court + date + time
- **Pre-save validation**: Checks availability before creating booking
- **Overlap detection**: Prevents any time overlap between bookings

---

## Venue Management

### Venue Lifecycle

1. **Creation**: Facility owner creates venue with details
2. **Pending**: Venue awaits admin approval
3. **Approved/Rejected**: Admin reviews and decides
4. **Active**: Approved venues visible to users

### Venue Features

- Multiple sports per venue
- Up to 10 images (stored in Cloudinary)
- Amenities list (parking, changing rooms, etc.)
- Location with address
- Each venue can have multiple courts

### Court Management

- Each court supports **one sport type**
- Independent pricing per court
- Can be marked active/inactive
- Weekly schedule configuration

### Court Unavailability

Facility owners can mark courts unavailable for:

- **Maintenance**: Scheduled maintenance work
- **Private Events**: Reserved for private functions
- **Holidays**: Special closure days

Features:

- Date/time range selection
- Recurring weekly unavailability option
- Doesn't affect weekly configuration (preserved)
- Users cannot book during unavailable periods

---

## Business Rules

### Commission System

- Admin charges **10% commission** on all bookings
- Configurable through AdminSettings
- Applied to all facility owners uniformly

### Booking Restrictions

- **Advance Booking**: Maximum 7 days in advance (configurable)
- **Minimum Notice**: No minimum (can book same day if available)
- **Cancellation**: Minimum 2 hours before booking
- **Max Slots**: Up to 8 consecutive slots per booking

### Pricing

- **Default Price**: Set per court
- **Day-Specific Price**: Can override for specific days (weekends)
- **Total Calculation**: Number of slots × price per slot

---

## Database Schema Decisions

### Collections Structure

1. **Users**: WorkOS integration, role management
2. **Venues**: Multi-sport facilities with approval workflow
3. **Courts**: Individual courts with slot configurations
4. **Bookings**: Booking records with conflict prevention
5. **CourtUnavailability**: Maintenance and event management
6. **AdminSettings**: Global platform configuration

### Key Design Patterns

#### 1. Soft Deletes

- `isActive` flag on all major entities
- Data preserved for historical records

#### 2. Version Key Disabled

- `versionKey: false` for cleaner API responses
- No `__v` field in documents

#### 3. Indexed Fields

Strategic indexes for common queries:

- User: `workosId`, `email`, `role`
- Venue: `status`, `ownerId`, location (2dsphere)
- Court: `venueId`, `sportType`
- Booking: Compound indexes for conflict detection

#### 4. Virtuals

- User → venues, bookings
- Venue → courts, bookings
- Court → bookings, unavailabilities

### Static Methods

Custom static methods for common operations:

```javascript
User.findByWorkosId(id)
Venue.findApproved()
Court.findByVenue(venueId)
Booking.isSlotAvailable(...)
AdminSettings.getSettings()
```

---

## Technical Stack

### Backend

- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **WorkOS** for authentication
- **Cloudinary** for image storage

### Frontend

- **React** with TypeScript
- **Vite** as build tool
- **WorkOS AuthKit** for authentication UI

### Database

- **MongoDB** (local or Atlas)
- **Mongoose** for schema and validation

---

## Implementation Phases

### Phase 1: Database & Authentication ✅

- Database schema design
- Model creation with TypeScript
- WorkOS integration planning

### Phase 2: API Structure (Next)

- Express routes setup
- Authentication middleware
- Role-based access control

### Phase 3: Facility Owner Features

- Venue CRUD operations
- Court management
- Slot configuration

### Phase 4: User Booking Flow

- Venue search and filtering
- Slot availability checking
- Booking creation

### Phase 5: Admin Panel

- Venue approval system
- User management
- Settings configuration

### Phase 6: Frontend Integration

- React components
- API integration
- UI/UX implementation

---

## Important Notes

### Slot Management Complexity

The most complex part of the system is slot management:

- Each court has 7 independent daily configurations
- Slots can have different durations on different days
- Multiple consecutive slots can be booked together
- Unavailability periods overlay but don't modify base configuration

### Scalability Considerations

- Indexes optimized for read-heavy operations
- Slot availability cached where possible
- Database connection pooling configured
- Graceful shutdown handling

### Future Enhancements (Not in Phase 1)

- Reviews and ratings system
- Real-time slot updates (WebSocket)
- Payment gateway integration
- Mobile application
- Email/SMS notifications
- Advanced analytics dashboard

---

## API Endpoint Planning (Upcoming)

### User Endpoints

- `GET /api/venues` - List approved venues
- `GET /api/venues/:id` - Venue details
- `GET /api/courts/:id/slots` - Available slots
- `POST /api/bookings` - Create booking
- `GET /api/users/bookings` - User's bookings
- `DELETE /api/bookings/:id` - Cancel booking

### Facility Owner Endpoints

- `POST /api/venues` - Create venue
- `PUT /api/venues/:id` - Update venue
- `POST /api/courts` - Add court
- `PUT /api/courts/:id/schedule` - Update slot configuration
- `POST /api/courts/:id/unavailability` - Mark unavailable

### Admin Endpoints

- `GET /api/admin/venues/pending` - Pending venues
- `PUT /api/admin/venues/:id/approve` - Approve venue
- `PUT /api/admin/venues/:id/reject` - Reject venue
- `GET /api/admin/users` - All users
- `PUT /api/admin/settings` - Update settings

---

_Last Updated: December 2024_
_This document serves as the single source of truth for QuickCourt's business logic and technical requirements._
