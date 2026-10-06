# Finance Dashboard

A finance dashboard application built with React 19 + Vite (frontend) and Node.js + Express (backend), using MongoDB and Redis.

## Project Structure

The project follows a modular structure as defined in the harness:
- `frontend/` - React 19 + Vite frontend application
- `backend/` - Node.js + Express backend API
- `tests/` - Unit, integration, and e2e tests
- `docs/` - Project documentation

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Community Edition 7.x (running locally or accessible via URI)
- Redis 7 (running locally or accessible)

## Setup

### Environment Variables

Copy the example environment file and configure as needed:

```bash
cp .env.example .env
```

Update the values in `.env` for your environment.

### Backend Setup

```bash
cd backend
npm install
npm run dev  # Development mode with nodemon
npm start    # Production mode
```

Backend will run on `http://localhost:5000` by default.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev    # Development server
npm run build  # Build for production
npm run preview # Preview production build
```

Frontend will run on `http://localhost:5173` by default.

## API Endpoints

- `GET /` - API welcome message
- `GET /api/health` - Health check endpoint (returns status of database and redis connections)

## Build

### Frontend Production Build

```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`.

### Backend

The backend runs with Node.js - no build step required.

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests (if configured)
cd frontend
npm test
```

## Notes

- The backend handles database and Redis connections gracefully - the application will start even if these services are unavailable.
- All configuration is done through environment variables.
- Business logic stays in service layers (to be implemented as modules are added).
- All data-driven UI areas must support Loading, Empty, Error states.