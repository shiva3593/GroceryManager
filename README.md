
# Grocery Manager

A full-stack Grocery Manager application for streamlined meal planning, shopping, and recipe management.

## Features

- 🔐 JWT Authentication with login/register capabilities
- 📱 Mobile-first design with bottom navigation
- 📖 Recipe Management
  - Intelligent recipe import from URLs
  - Recipe comparison tool
  - Ingredient editing
  - Recipe favorites
- 🛒 Shopping List
  - Category-based organization
  - Smart list generation from recipes
- 📦 Inventory Management
  - Barcode scanning support
  - Expiry tracking
  - Stock levels
- 💫 Modern Tech Stack
  - React + TypeScript frontend
  - Express.js backend
  - PostgreSQL database
  - Tailwind CSS + Shadcn UI
  - Drizzle ORM

## Prerequisites

- Node.js v20+
- PostgreSQL 15+
- npm

## Quick Start

1. Run the setup script:
```bash
chmod +x setup.sh
./setup.sh
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at http://0.0.0.0:5000

## Environment Variables

Create a `.env` file with:
```
DATABASE_URL="postgres://localhost:5432/grocery_manager"
JWT_SECRET="your-secret-key"
```

## Development

- Frontend runs on Vite with HMR
- Backend uses Express with TypeScript
- Database migrations handled by Drizzle ORM

## Deployment

This project is configured for deployment on Replit. Visit the Deployments tab to publish your changes.
