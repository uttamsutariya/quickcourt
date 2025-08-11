# Booking Configuration

## Booking Advance Days Limit

The system allows users to book courts up to **7 days in advance** by default. This is configured in:

### Backend Configuration

- **Location**: `backend/src/models/AdminSettings.model.ts`
- **Field**: `maxBookingAdvanceDays`
- **Default Value**: 7 days
- **Range**: 1-365 days (configurable by admin)

### Frontend Implementation

- **Location**: `frontend/src/components/booking/BookingModal.tsx`
- **Constant**: `MAX_BOOKING_DAYS = 7`
- **Matches**: Backend default value

### Why 7 Days?

- Provides adequate planning time for users
- Prevents far-future bookings that may be cancelled
- Manageable window for facility owners
- Can be adjusted by admin through settings

## Slot Selection Limits

### Maximum Slots Per Booking

- **Limit**: 4 slots (consecutive or non-consecutive)
- **Validation**: Applied in frontend during selection
- **Error Message**: "You can select a maximum of 4 slots"

### Implementation Details

#### Frontend Validation (`BookingModal.tsx`)

1. **Selection Prevention**: Users cannot select more than 4 slots
2. **Visual Indicator**: Shows "X/4 slots selected" badge
3. **Color Coding**: Badge turns red when limit is reached
4. **Toast Notification**: Shows error when trying to exceed limit

#### Business Rules

- Users can select 1-4 slots per booking
- Slots can be consecutive or non-consecutive
- Each slot duration is defined by court configuration (1-4 hours)
- Total booking duration = number of slots × slot duration

## Future Enhancements

### Dynamic Configuration

Consider implementing:

1. **API Endpoint**: Fetch admin settings including `maxBookingAdvanceDays`
2. **Dynamic Limits**: Allow admin to configure max slots per booking
3. **User-based Limits**: Different limits for different user tiers
4. **Sport-specific Rules**: Different limits for different sports

### Example API Integration

```typescript
// Fetch admin settings on app initialization
const settings = await adminService.getSettings();
const MAX_BOOKING_DAYS = settings.maxBookingAdvanceDays;
const MAX_SLOTS_PER_BOOKING = settings.maxSlotsPerBooking || 4;
```

## Current Status

- ✅ 7-day advance booking limit (aligned with backend)
- ✅ 4-slot maximum per booking (frontend validation)
- ✅ Visual indicators for slot selection limits
- ✅ Proper error messages and validation
