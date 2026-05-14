# TravelPoints Frontend

TravelPoints is a React-based single-page application (SPA) designed for exploring and managing tourist attractions. It provides a dedicated interface for both tourists and administrators, offering attraction discovery, wishlist management, reviews, and analytics.

## Features

- **Role-Based Access Control**: Differentiates between 'Tourist' and 'Admin' roles using JWT-based authentication.
- **Attraction Catalog**: Browse attractions with real-time filtering by name, location, and category.
- **Wishlist Management**: Authenticated users can save and manage their favorite attractions.
- **Audio Guides**: Integrated audio players for attractions offering guided tours.
- **Reviews & Contact**: Users can submit reviews for attractions or contact administrators with suggestions.
- **Administrative Tools**: Admins can create, edit, and delete attractions.
- **Analytics Dashboard**: Visual representations of attraction popularity and visitor flux over time using interactive charts.
- **Real-Time Notifications**: Server-Sent Events (SSE) integration for real-time updates.

## Technology Stack

- **Framework**: React 19, TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Data Fetching & Caching**: TanStack Query (React Query) v5
- **UI & Styling**: React Bootstrap, Custom CSS
- **Data Visualization**: Chart.js, react-chartjs-2
- **Forms & Validation**: Formik, Yup

## Quick Start

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (Node Package Manager)

### Installation

1. Clone the repository and navigate to the project directory.
2. Install the project dependencies:

   ```bash
   npm install
   ```

### Configuration

The application communicates with a backend API. Ensure your backend is running. The API endpoints can be configured using environment variables in a `.env` file (e.g., `VITE_API_ENTRYPOINT`). By default, it will fall back to the window host.

### Development

To start the local development server with hot-module replacement (HMR):

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173` (or the port specified by Vite).

### Production Build

To create an optimized production build:

```bash
npm run build
```

This will generate the built assets in the `dist` directory. You can preview the production build locally using:

```bash
npm run preview
```
