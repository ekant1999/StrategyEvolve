# PostgreSQL Database Setup

This guide will help you set up PostgreSQL for the StrategyEvolve backend.

## Prerequisites

- PostgreSQL 12+ installed on your system
- Node.js 18+ installed

## Installation

### macOS (using Homebrew)
```bash
brew install postgresql@14
brew services start postgresql@14
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Windows
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

## Database Setup

1. **Create the database:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE strategy_evolve;

# Create a user (optional, you can use postgres user)
CREATE USER strategy_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE strategy_evolve TO strategy_user;

# Exit psql
\q
```

2. **Configure environment variables:**

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=strategy_evolve
DB_USER=postgres
DB_PASSWORD=postgres

# Fastino API
FASTINO_API_KEY=your_fastino_api_key_here

# LinkUp API
LINKUP_API_KEY=your_linkup_api_key_here

# LiquidMetal Raindrop API (optional)
LM_API_KEY=your_liquidmetal_api_key_here
```

**Important:** Replace `DB_PASSWORD` with your actual PostgreSQL password.

## Automatic Schema Initialization

The database schema is automatically created when you start the server. The `initDatabase()` function will:

- Create all necessary tables (users, strategies, trades, evolution_events)
- Create indexes for better query performance
- Initialize the base strategy if it doesn't exist

## Database Schema

### Tables

1. **users** - User accounts and profiles
2. **strategies** - Trading strategies with parameters and metrics
3. **trades** - User trade history
4. **evolution_events** - Strategy evolution history

### Indexes

- `idx_trades_user_id` - Fast lookup of trades by user
- `idx_trades_created_at` - Sorted trade history
- `idx_evolution_events_created_at` - Sorted evolution history
- `idx_strategies_type` - Fast lookup by strategy type

## Running the Application

1. **Start PostgreSQL** (if not running as a service):
```bash
# macOS
brew services start postgresql@14

# Linux
sudo systemctl start postgresql
```

2. **Start the backend server:**
```bash
cd backend
npm run dev
```

The server will automatically:
- Connect to PostgreSQL
- Initialize the database schema
- Create the base strategy if needed

## Troubleshooting

### Connection Error
If you see a connection error, check:
- PostgreSQL is running: `pg_isready` or `psql -U postgres`
- Database exists: `psql -U postgres -l` (should list `strategy_evolve`)
- Credentials in `.env` are correct

### Permission Denied
If you get permission errors:
```bash
# Grant permissions
psql -U postgres
GRANT ALL PRIVILEGES ON DATABASE strategy_evolve TO postgres;
```

### Reset Database
To reset the database (⚠️ **WARNING: This deletes all data**):
```bash
psql -U postgres
DROP DATABASE strategy_evolve;
CREATE DATABASE strategy_evolve;
\q
```

Then restart the server - it will recreate all tables.

## Production Considerations

For production, consider:
- Using connection pooling (already configured)
- Setting up database backups
- Using environment-specific `.env` files
- Configuring SSL connections
- Using a managed PostgreSQL service (AWS RDS, Heroku Postgres, etc.)

