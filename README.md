# Campus Parking

An interactive web application for finding and reserving parking spots on campus. Users can view real-time spot availability on a visual map, select a space, and complete a simple booking flow with cost calculation.

**Live demo:** [https://otisopoku.github.io/campus-parking-Apple-Sub-A/](https://otisopoku.github.io/campus-parking-Apple-Sub-A/)

---

## Overview

Campus Parking is a front-end project built for the Engineering Technology final project (Group: **Apple Sub A**). It simulates a campus parking reservation system for the **PB Parking Lot**, allowing students and staff to browse available spaces, review parking details, and confirm a reservation in a few steps.

The app runs entirely in the browser with no backend — spot availability is randomized on load for demonstration purposes.

---

## Features

- **Interactive parking map** — 10 spots across two rows (A1–A5 and B1–B5)
- **Color-coded status** — Available, Occupied, and Selected states with a visual legend
- **Spot selection** — Click an available spot to select it; other spots lock until you change your selection
- **Parking details panel** — Shows selected spot, hourly rate, and EV charging info
- **Checkout flow** — Proceed to a booking screen to set duration (1–480 minutes)
- **Live cost calculation** — Total updates automatically at GHC 0.10 per minute
- **Booking confirmation** — Confirms the reservation, marks the spot as occupied, and shows a thank-you message
- **Responsive layout** — Works on desktop and mobile screen sizes
- **Accessibility** — ARIA labels, live regions, and keyboard-friendly controls

---

## Screenshots

| Parking map | Booking screen |
|-------------|----------------|
| Select a spot from the interactive grid | Set minutes and confirm your reservation |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, Flexbox, Grid) |
| Logic | Vanilla JavaScript (ES6+) |
| Fonts | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |
| Hosting | GitHub Pages |

---

## Project Structure

```
FinalProject/
├── index.html      # Main page structure and views
├── style.css       # Layout, components, and responsive styles
├── app.js          # Spot selection, booking flow, and availability logic
├── location.png    # Icon for selected spot
├── time.png        # Icon for rate
├── battery.png     # Icon for EV charging
└── README.md       # Project documentation
```

---

## How It Works

### 1. View availability
On page load, the app randomly assigns occupied and available states to each spot (roughly 45% occupied). At least one spot always remains free so the demo stays usable.

### 2. Select a spot
Click any available (green) spot. It turns blue (selected), the details panel updates, and **Proceed to Checkout** / **Change Area** become active.

### 3. Proceed to checkout
The booking view opens with the selected spot, a duration input (default 60 minutes), and a live cost breakdown:

```
Total = GHC 0.10 × minutes
```

### 4. Confirm booking
After confirmation, the spot is marked occupied, selection is cleared, the map view returns, and a thank-you toast appears for a few seconds.

---

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, or Safari)
- No build tools or package manager required

### Run locally

1. Clone the repository:

   ```bash
   git clone https://github.com/Otisopoku/campus-parking-Apple-Sub-A.git
   cd campus-parking-Apple-Sub-A
   ```

2. Open `index.html` in your browser, or serve the folder with a local server:

   ```bash
   # Python 3
   python -m http.server 8000
   ```

3. Visit `http://localhost:8000` in your browser.

---

## Key Configuration

Spot list and pricing are defined at the top of `app.js`:

```javascript
const SPOTS = ["A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3", "B4", "B5"];
const RATE_PER_MIN = 0.1; // GHC per minute
```

The checkout panel displays **GHC 2.50 / hour** as reference pricing; the booking screen uses the per-minute rate for calculation.

---

## Future Improvements

- Connect to a real backend API for live spot availability
- User authentication (Log In / Sign Up)
- Payment integration for completed bookings
- Seasonal permit application flow
- Admin dashboard to manage lot occupancy
- Persistent bookings using local storage or a database

---

## Team

**Group:** Apple Sub A  
**Course:** Engineering Technology — Final Project  
**Institution:** KNUST

---

## License

This project was created for academic purposes as part of the Engineering Technology programme at KNUST.

---

## Repository

GitHub: [https://github.com/Otisopoku/campus-parking-Apple-Sub-A](https://github.com/Otisopoku/campus-parking-Apple-Sub-A)
