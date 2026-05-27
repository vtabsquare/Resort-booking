# Google Sheets Database Structure & Explanation

This document explains every single column in your Google Sheets database, along with examples, so you know exactly what data to enter when managing your resort.

## 1. Rooms (Your room inventory)
Contains all the physical rooms or villas available for booking.

*   **`id`**: A unique text identifier. Example: `room_1` or `luxury_suite_A`.
*   **`name`**: The display name on the website. Example: `Emerald Tea Suite`.
*   **`category`**: The tier or type of accommodation. Example: `Luxury Suite`, `Premium Villa`.
*   **`price`**: Base price per night in Rupees. Example: `12000` (Just the number, no currency symbol).
*   **`bedType`**: Type of beds. Example: `1 King Bed`, `2 Twin Beds`.
*   **`size`**: Room size in square feet. Example: `650`.
*   **`view`**: What the guest sees from the room. Example: `Tea Garden View`, `Valley View`.
*   **`isOccupied`**: Whether the room is currently blocked/occupied. Use `TRUE` or `FALSE`.
*   **`amenities`**: A comma-separated list of amenity IDs the room has. Example: `wifi, pool, spa`.

---

## 2. Bookings (Guest reservations)
Stores all guest reservations and details.

*   **`id`**: Unique booking ID. Example: `BKG-10452`.
*   **`guestName`**: Full name of the guest. Example: `Rahul Sharma`.
*   **`email`**: Guest email. Example: `rahul@example.com`.
*   **`phone`**: Guest phone number. Example: `+91 9876543210`.
*   **`roomName`**: Name of the booked room. Example: `Emerald Tea Suite`.
*   **`checkIn`**: Check-in date. Example: `2026-06-15`.
*   **`checkOut`**: Check-out date. Example: `2026-06-18`.
*   **`guests`**: Number of guests. Example: `2 Adults, 1 Child`.
*   **`food`**: Selected food package. Example: `All-Inclusive Plan`.
*   **`sightseeing`**: Selected sightseeing package. Example: `Tea Factory Tour`.
*   **`specialRequests`**: Any extra requests. Example: `Require a crib for baby`.
*   **`totalAmount`**: Total cost in Rupees. Example: `45000`.
*   **`status`**: Current state of booking. Example: `Pending`, `Confirmed`, or `Cancelled`.
*   **`dateCreated`**: When the booking was made. Example: `2026-05-21`.

---

## 3. FoodPackages (Meal plans)
Meal plans that guests can add to their stay.

*   **`id`**: Unique identifier. Example: `pkg_full`.
*   **`name`**: Name of the plan. Example: `Full Board Plan`.
*   **`price`**: Price per person per day. Example: `2500`.
*   **`description`**: Short explanation. Example: `Includes Breakfast, Lunch, and Dinner`.
*   **`includes`**: Comma-separated list of perks. Example: `Buffet Breakfast, 4-course Dinner, High Tea`.

---

## 4. Sightseeing (Tours & Excursions)
Tours and activities around Munnar.

*   **`id`**: Unique identifier. Example: `tour_factory`.
*   **`name`**: Tour name. Example: `Kolukkumalai Jeep Safari`.
*   **`price`**: Price per person. Example: `1500`.
*   **`duration`**: How long it lasts. Example: `Half Day`, `4 Hours`.
*   **`description`**: What the tour involves. Example: `Off-road jeep ride to the highest tea estate in the world`.

---

## 5. Reviews (Guest feedback)
Feedback displayed on the front page of the website.

*   **`id`**: Unique identifier. Example: `rev_102`.
*   **`name`**: Reviewer's name. Example: `Priya Patel`.
*   **`date`**: Date of the review. Example: `May 2026`.
*   **`rating`**: Score out of 5. Example: `5` or `4.5`.
*   **`comment`**: The actual review text. Example: `Absolutely stunning views and great service!`.
*   **`room`**: The room they stayed in. Example: `Premium Villa`.
*   **`avatar`**: URL to their profile picture. Example: `https://example.com/avatar.jpg`.
*   **`approved`**: Whether to show it on the website publicly. Use `TRUE` or `FALSE`.

---

## 6. Settings (Global variables)
Global configuration variables for the resort.

*   **`key`**: The setting name. Example: `seasonalMultiplier`.
*   **`value`**: The setting value. Example: `1.15` (which means a 15% increase in base room prices for peak season).

---

## 7. Gallery (Website photos)
Images used across the website.

*   **`id`**: Unique identifier. Example: `img_pool`.
*   **`url`**: Direct web link to the image. Example: `https://images.unsplash.com/photo-123...`
*   **`name`**: Short description. Example: `Infinity Pool at Sunset`.

---

## 8. Admins (Dashboard access)
Credentials for securely logging into the admin dashboard.

*   **`id`**: Unique identifier. Example: `admin_1`.
*   **`username`**: Login username. Example: `admin_munnar`.
*   **`password`**: Login password. Example: `SecretPass123!`.

---

## 9. Amenities (Room features)
Master list of all possible room features.

*   **`id`**: Unique identifier. Example: `wifi`, `pool`, `spa`.
*   **`name`**: Display name. Example: `High-Speed Wi-Fi`.
*   **`icon`**: An emoji or icon code. Example: `📶`, `🏊`.
