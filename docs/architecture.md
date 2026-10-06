# Architecture

## Overview

The Finance Dashboard follows a modular architecture with clear separation of concerns:

- **Frontend**: React 19 + Vite - Single Page Application serving the user interface
- **Backend**: Node.js + Express - REST API server
- **Database**: MongoDB 7.x - Persistent data storage
- **Cache**: Redis 7 - Caching layer for frequently accessed data

## Data Flow

1. Frontend makes HTTP requests to backend API
2. Backend validates requests and applies business logic
3. Backend accesses MongoDB for persistent storage
4. Backend uses Redis for caching where appropriate
5. Backend returns consistent API responses

## Key Principles

- Frontend never directly accesses MongoDB or Redis
- Business logic resides in the service layer (backend modules)
- All financial calculations happen on the backend
- Centralized error handling
- Consistent API response format
- Graceful handling of service failures
- Configuration via environment variables