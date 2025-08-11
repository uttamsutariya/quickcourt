# QuickCourt - Key Decisions and Clarifications

## Quick Reference Guide

This document captures the specific decisions and clarifications made during the initial development phase.

---

## 📝 Key Business Decisions

### Time Slot Management

✅ **Decision**: Court-based, not facility-based management

- Each court has independent slot configurations
- 7 configurations per court (one per weekday)
- Owners can set different slot durations for different days

### Booking Duration

✅ **Decision**: Whole hours only (1, 2, 3, or 4 hours)

- No fractional hours (1.5, 2.5, etc.)
- Users can book multiple consecutive slots

### Advance Booking

✅ **Decision**: Maximum 7 days in advance

- Changed from initial 90 days to 7 days for practicality
- No minimum advance time (can book same day)

### Cancellation Policy

✅ **Decision**: Minimum 2 hours before booking

- Only users can cancel (not facility owners)
- Cancelled slots immediately become available

### Commission

✅ **Decision**: Fixed 10% for all facility owners

- Stored in AdminSettings collection
- Can be modified by admin later

---

## 🏗️ Technical Decisions

### Authentication

✅ **Decision**: WorkOS AuthKit on client-side

- No backend authentication implementation needed
- Role stored in both WorkOS metadata and MongoDB
- WorkOS ID is the primary user identifier

### Image Storage

✅ **Decision**: Cloudinary for all images

- Maximum 10 images per venue
- URLs stored in database

### Real-time Updates

✅ **Decision**: Not in Phase 1

- No WebSocket implementation initially
- Users need to refresh for availability updates

### Payment

✅ **Decision**: Simulated only

- No actual payment gateway integration
- `paymentSimulated` boolean flag in bookings

### Reviews/Ratings

✅ **Decision**: Deferred to later phase

- Schema mentions it but not implemented in Phase 1

---

## 🗃️ Database Schema Decisions

### Version Key

✅ **Decision**: Disabled (`versionKey: false`)

- Cleaner API responses
- Using `toJSON` transform to remove `__v`

### Soft Deletes

✅ **Decision**: Using `isActive` flag

- Data preservation for audit trails
- All queries filter by `isActive: true`

### Default Court Schedule

✅ **Decision**: All days open by default

- Changed from "closed on Sunday" to all days open
- Owners can modify as needed

### Predefined Sports

✅ **Decision**: 16 sports types predefined

```
Cricket, Badminton, Tennis, Table Tennis, Football,
Basketball, Volleyball, Swimming, Squash, Hockey,
Baseball, Golf, Boxing, Gym/Fitness, Yoga, Other
```

---

## 🔧 Implementation Details

### TypeScript Strict Mode

✅ **Decision**: Using TypeScript with proper typing

- Interfaces for all models
- Static method interfaces
- Enum types for constants

### Model Static Methods

✅ **Decision**: Typed with separate interface file

- `model-statics.ts` for static method interfaces
- Prevents TypeScript errors with Mongoose statics

### Slot Availability Display

✅ **Decision**: Show next 3 days only

- Prevents far-future bookings
- Reduces query complexity
- Better user experience

### Court Unavailability

✅ **Decision**: Separate from slot configuration

- Stored in `CourtUnavailability` collection
- Preserves weekly settings
- Supports recurring unavailability

---

## 📊 Data Relationships

### Ownership Hierarchy

```
User (Facility Owner)
  └── Multiple Venues
       └── Multiple Courts (per venue)
            └── One Sport Type (per court)
            └── 7 Slot Configs (per court)
            └── Multiple Bookings
```

### Single vs Multiple

- ✅ One facility owner → Multiple venues
- ✅ One venue → Multiple sports
- ✅ One venue → Multiple courts
- ❌ One court → One sport only
- ✅ One court → Multiple bookings

---

## 🚫 What We're NOT Doing (Phase 1)

1. **No actual payments** - Only simulation
2. **No real-time updates** - Manual refresh needed
3. **No email/SMS notifications**
4. **No reviews/ratings system**
5. **No mobile app** - Web only
6. **No social login** - WorkOS handles all auth
7. **No dynamic pricing** - Fixed prices per slot
8. **No waiting lists** - Direct booking only
9. **No recurring bookings** - Single bookings only
10. **No match creation** - Only court booking

---

## 📝 MongoDB Configuration

### Connection Settings

```javascript
{
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  w: 'majority',
  retryWrites: true
}
```

### Default Database

- Development: `mongodb://localhost:27017/quickcourt`
- Production: Set via `MONGODB_URI` environment variable

---

## 🎯 Next Steps Priority

1. **API Structure** - Set up Express routes
2. **Auth Middleware** - WorkOS token validation
3. **Venue APIs** - CRUD operations
4. **Court Management** - Slot configuration
5. **Booking Flow** - Availability and creation
6. **Admin Panel** - Approval system
7. **Frontend** - React components
8. **Testing** - Unit and integration tests
9. **Deployment** - Production setup
10. **Documentation** - API documentation

---

## ⚠️ Important Reminders

- **Always check court availability** at database level
- **Validate slot overlaps** before booking
- **Handle time zones** consistently (store in UTC)
- **Escape special regex chars** in search queries
- **Index frequently queried fields** for performance
- **Use transactions** for booking creation
- **Implement rate limiting** for API endpoints
- **Add request validation** with Zod schemas
- **Log all critical operations** for debugging
- **Handle edge cases** in slot calculations

---

_This document should be updated as new decisions are made during development._
