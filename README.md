# QuickCourt - A Local Sports Booking Platform

## Overview

QuickCourt is a comprehensive platform that enables sports enthusiasts to book local sports facilities (e.g., badminton courts, turf grounds, tennis tables) and create or join matches with others in their area. The platform provides a full-stack web application that facilitates an end-to-end booking experience with three distinct user roles: Users, Facility Owners, and Admins.

## User Roles

- **User** - Sports enthusiasts who book facilities
- **Facility Owner** - Venue owners who manage sports facilities
- **Admin** - Platform administrators who oversee operations

## Features & Functionalities Implemented

### 🏃 User Role

#### Authentication

- **Login** with email and password
- **Sign up** with email, password, full name, avatar, and role selection
- **OTP verification** step after signup for enhanced security

#### Home Page

- Welcome banner
- Quick access sections:
  - Popular venues carousel
  - Popular sports carousel

#### Venues Page

- **Browse all approved sports venues**
- **Search functionality** - Search venues by name
- **Advanced Filters:**
  - Sport type
  - Price range
  - Venue type
  - Rating
- **Pagination** for better navigation
- **Venue Cards display:**
  - Venue name
  - Sport type(s)
  - Starting price per hour
  - Location summary
  - Rating (based on reviews)

#### Single Venue Page

- **Comprehensive venue details:**
  - Name, description, and full address
  - List of available sports
  - Amenities
  - About venue section
  - Photo gallery
  - Reviews section
- **Book Now** action button

#### Court Booking System

- **Step-by-step booking process:**
  1. Select sport
  2. Select date
  3. Select court
  4. Select time slot
  5. View price and total
  6. Confirm and simulate payment
- Automatic redirect to "My Bookings" after successful booking

#### My Bookings Page

- **View all court bookings**
- **Booking cards show:**
  - Venue name, sport type, court name
  - Date and time of booking
  - Status: Confirmed / Cancelled / Completed
- **Cancel booking** option (for future bookings)
- **Filters** by date or status (optional)

#### Ratings & Reviews

- **Review eligibility:** Users can only review venues they have booked
- **One-time review** per venue per user
- Reviews can be given for both upcoming and completed bookings

#### Profile Management

- Display user details (Name, Email)
- Edit and update personal information

### 🏢 Facility Owner Role

#### Dashboard

**Venue Overview:**

- Total bookings per venue
- Total approved venues
- Total pending venues
- Total rejected venues

**Booking Statistics:**

- Total bookings count
- Today's bookings
- This month's bookings
- Upcoming bookings
- Completed bookings
- Cancelled bookings

**Filters:**

- **Time period:** All, Today, Upcoming, Past
- **Status:** Confirmed, Completed, Cancelled
- **Venue-specific** filtering

**Booking Cards include:**

- Username
- Venue name
- Sport name
- Court name
- Date and time

**Financial Overview:**

- Active courts available for booking
- Net earnings (after 10% commission deduction)

**Analytics Charts:**

- **Weekly/Monthly Booking Trends** (Line/Bar Chart)
- **Earnings Summary** (Bar/Pie Chart)
- **Peak Booking Hours** (Bar Chart)

#### Facility Management

**Venue Management:**

- Add/Edit facility details:
  - Name, location, description
  - Supported sports types
  - Multiple photo uploads

#### Court Management

**Add New Court:**

- Court name
- Sport type
- Description
- Default price per slot

**Schedule Management:**

- Configure start time
- Set slot duration
- Define number of slots
- Price per slot
- **Bulk configuration:** Copy same settings for entire week
- **Custom availability:** Mark courts unavailable for:
  - Holidays
  - Personal events
  - Public holidays
- Edit/Delete existing courts

#### Profile Page

- Display owner details
- Update profile information

### 👨‍💼 Admin Role

#### Dashboard

**Financial Metrics:**

- Total earnings
- Monthly earnings

**Operational Metrics:**

- Total bookings
- Active courts

**Venue Statistics:**

- Total venues
- Pending approval requests
- Approved venues
- Rejected venues

#### Manage Venues

**Features:**

- **Filtering options:**
  - Name
  - Description
  - Status
  - City
  - State
- **Pagination**
- **Actions:** View / Approve / Reject (with reason)

#### User Management

**User Statistics:**

- Regular users count
- Facility owners count

**Manage Users:**

- List all users across the platform
- View user role and status
- Access user's booking history
- Ban/Unban users
- **Filtering:** Name, Email, Role, Status

#### Analytics

**Earning Trends:**

- Daily earnings for last 30 days (Graph visualization)

**Booking Trends:**

- Daily bookings for last 30 days (Graph visualization)

#### Profile Page

- Display admin profile
- Update basic information

## Technologies

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- WorkOs for auth
- Typescript

### Frontend

- React.js
- Zustand
- React-Router-Dom
- Tailwind & ShadCN UI
- WorkOs for auth
- Typescript

## Team Members (Team - 78)

Uttam Sutariya

- https://github.com/uttamsutariya
- uttamsutariya.dev@gmail.com

Radhika Patel

- https://github.com/patelradhi
- patelradhi1710@gmail.com
