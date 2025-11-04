# PostgreSQL Database Setup for MediLink AI

This application now uses PostgreSQL to persist patient data, face descriptors, and hospital information.

## Quick Start

### 1. Install PostgreSQL

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from https://www.postgresql.org/download/windows/

### 2. Create Database

Run the initialization script:
```bash
cd backend
./init_db.sh
```

Or manually:
```bash
createdb -U postgres medilink
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend/` directory:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medilink
```

**Note:** Update the username and password if your PostgreSQL setup differs.

### 4. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 5. Start the Backend

The database tables will be created automatically on first startup:
```bash
uvicorn main:app --reload
```

## Database Schema

### Tables

#### `hospitals`
- `id` (Integer, Primary Key)
- `name` (String)
- `latitude` (Float)
- `longitude` (Float)
- `icu_beds_available` (Integer)
- `icu_beds_total` (Integer)
- `has_trauma` (Boolean)
- `blood_stock` (JSON) - Stores blood inventory: `{"O+": 8, "O-": 3, ...}`

#### `patients`
- `id` (Integer, Primary Key, Auto-increment)
- `name` (String)
- `age` (Integer)
- `blood_type` (String)
- `photo` (String, nullable)
- `medical_history` (JSON) - Stores medical information
- `face_descriptor` (JSON) - Stores 128-dimensional face descriptor array
- `created_at` (DateTime)
- `updated_at` (DateTime)

## Features

### Persistent Face Registration
- Face descriptors are stored in the database
- Patients don't need to re-register on server restart
- Face matching queries all registered patients from the database

### Data Persistence
- All patient registrations are saved
- Hospital data is seeded on first startup
- Medical history is preserved

### Fallback Mode
- If database connection fails, the app falls back to in-memory storage
- Legacy data structures are maintained for compatibility

## Troubleshooting

### Connection Issues

**Error: "could not connect to server"**
- Ensure PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Check if database exists: `psql -U postgres -l`

**Error: "password authentication failed"**
- Update `.env` file with correct credentials
- Or reset PostgreSQL password: `psql -U postgres -c "ALTER USER postgres PASSWORD 'postgres';"`

**Error: "database does not exist"**
- Run: `createdb -U postgres medilink`

### Migration from In-Memory

The application automatically seeds initial data on first startup. Existing demo patients and hospitals will be added to the database if tables are empty.

## Testing

Test the database connection:
```bash
python3 -c "from database import init_db; init_db(); print('✅ Database connected')"
```

## Production Notes

For production, consider:
- Using environment variables for sensitive credentials
- Setting up database backups
- Using connection pooling
- Implementing database migrations with Alembic

