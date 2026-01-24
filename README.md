# BlockBuzz

BlockBuzz is a comprehensive event management and recommendation platform designed to enhance user engagement through smart recommendations and incident intelligence. The platform leverages modern web technologies and advanced machine learning models to provide a seamless experience for organizers, volunteers, and attendees.

## Project Overview

The project consists of several key components working together:

*   **Next.js Application**: The core web application built with Next.js 16, serving the frontend and API routes.
*   **Recommendation System**: A Python-based service (FastAPI) that powers the event recommendation engine, utilizing collaborative filtering and popularity-based algorithms.
*   **Incident Intelligence Service**: A dedicated service for detecting and scoring event-related incidents, analyzing risk profiles for venues and hosts.
*   **Auto Data Loading**: A set of Python scripts designed to populate the database with synthetic data for testing and development purposes.

## File System Structure

A brief overview of the project structure:

*   `app/`: Contains the Next.js 16 source code, including pages, components, and API routes.
*   `recommendation_system/`: The Python FastAPI service responsible for generating event recommendations.
    *   `app/main.py`: Entry point for the recommendation service.
    *   `learning/`: Contains logic for model training and scoring.
*   `incident-intelligence-service/`: The Python service for incident detection and risk analysis.
    *   `app/main.py`: Entry point for the incident intelligence service.
*   `auto_data_loading/`: Scripts for generating and loading dummy data into the database.
    *   `main.py`: Master script to run all data loading modules.
*   `prisma/`: Database schema (`schema.prisma`) and migrations.
*   `public/`: Static assets.

## Environment Variables

To run the project, you need to set up your environment variables. Create a `.env` file in the root directory with the following structure:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/blockbuzz?schema=public"

# Authentication
JWT_SECRET="your-secure-jwt-secret"

# Service Configuration (Adjust ports/URLs as needed)
# NEXT_PUBLIC_API_URL="http://localhost:3000"
# RECOMMENDATION_SERVICE_URL="http://localhost:8000"
```

> **Note**: Ensure your PostgreSQL database is running and the `DATABASE_URL` is correct.

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Prerequisites

Ensure you have the following installed on your machine:

*   **Python**: Version 3.8 or higher.
    *   Check version: `python --version`
*   **Bun** (preferred) or **Node.js**:
    *   Check Bun version: `bun --version`
    *   Check Node version: `node -v`
    *   Check NPM version: `npm -v`

### 2. Installation

Install the Node.js dependencies:

```bash
# Using Bun (Recommended)
bun install

# OR using NPM
npm install
```

Install Python dependencies (if `requirements.txt` is present in root or service folders, otherwise ensure you have necessary packages like `fastapi`, `uvicorn`, `prisma`, etc.):

```bash
# Example for installing common requirements
pip install fastapi uvicorn prisma pandas scikit-learn
```

### 3. Database Setup

Since this project uses Prisma migrations, run the migrations to set up your database schema:

```bash
# Using Bun
bunx --bun prisma migrate dev

# OR using NPM
npx prisma migrate dev
```

### 4. Data Loading

Populate the database with initial data using the auto-loading script:

```bash
# Using Bun
bun data_load

# OR using NPM
npm run data_load
```

> This script runs the Python automation located in `auto_data_loading/main.py`.

### 5. Running the Project

Start the development server. This command concurrently runs the Next.js app and the Recommendation System (Python).

```bash
# Using Bun
bun dev

# OR using NPM
npm run dev
```

*   **Next.js App**: Running at `http://localhost:3000`
*   **Recommendation Service**: Running at `http://localhost:8000` (default for uvicorn)

### 6. Other Commands

*   **Linting**: Run code linting tools.
    ```bash
    bun run lint
    ```
*   **Build**: Build the Next.js application for production.
    ```bash
    bun build
    ```
