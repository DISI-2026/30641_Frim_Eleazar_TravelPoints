# TravelPoints

TravelPoints is a full-stack web application for discovering and managing tourist attractions. It provides an interface for users to browse locations, maintain a wishlist, and submit reviews, while offering administrators tools for content management and analytics.

## Architecture

The project consists of three main components:

- **Backend:** A RESTful API built with Java and Spring Boot.
- **Frontend:** A single-page application built with React, TypeScript, and Vite.
- **Database:** A PostgreSQL database, provisioned via Docker Compose.

## Features

- **Authentication & Authorization:** Role-based access control (Admin/Tourist) using JWT.
- **Attraction Management:** Browse, filter, and discover points of interest. Admins can create and update listings.
- **Wishlist & Reviews:** Authenticated users can save attractions to their wishlist and submit reviews.
- **Analytics:** Data visualization for attraction popularity and visitor trends.
- **Media Support:** Audio guides and image attachments for attractions.

## Quickstart

Follow these instructions to run the application locally.

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose (for the database)
- [Java 17](https://adoptium.net/) (or higher)
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (included with Node.js)

### 1. Start the Database

The project includes a `docker-compose.yml` file to quickly start a PostgreSQL instance on port `5433`.

```bash
cd backend/travelpoints-backend
docker compose up -d
```

### 2. Start the Backend Server

The Spring Boot application runs on port `8080` with the `/api` context path. It uses the Maven Wrapper, so you do not need Maven installed globally.

```bash
cd backend/travelpoints-backend

# On Linux/macOS:
./mvnw spring-boot:run

# On Windows:
mvnw.cmd spring-boot:run
```

*Note: The application uses SMTP for email features. You may need to update the `spring.mail` credentials in `backend/travelpoints-backend/src/main/resources/application.yml` for email-dependent flows.*

### 3. Start the Frontend Application

The React application uses Vite and runs on port `5173`.

```bash
cd frontend
npm install
npm run dev
```

Once running, the application will be accessible in your browser at `http://localhost:5173`.

## Documentation

The OpenAPI specification for the backend endpoints is available in the `docs/openapi.yaml` file. Additional architectural diagrams are provided in `docs/TravelPoints_Diagrame.pdf`.
