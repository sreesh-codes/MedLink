#!/bin/bash

# Script to initialize PostgreSQL database for MediLink AI

echo "🚀 Initializing MediLink AI Database..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu: sudo apt-get install postgresql"
    exit 1
fi

# Database configuration
DB_NAME="medilink"
DB_USER="postgres"
DB_PASSWORD="postgres"

# Check if database exists
if psql -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "✅ Database '$DB_NAME' already exists"
else
    echo "📦 Creating database '$DB_NAME'..."
    createdb -U $DB_USER $DB_NAME || {
        echo "❌ Failed to create database. Trying with password..."
        PGPASSWORD=$DB_PASSWORD createdb -U $DB_USER $DB_NAME || {
            echo "❌ Failed to create database. Please run manually:"
            echo "   createdb -U postgres medilink"
            exit 1
        }
    }
    echo "✅ Database created successfully"
fi

echo ""
echo "✅ Database initialization complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Update .env file with your database credentials:"
echo "      DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medilink"
echo ""
echo "   2. Install Python dependencies:"
echo "      pip install -r requirements.txt"
echo ""
echo "   3. Start the backend server:"
echo "      uvicorn main:app --reload"
echo ""
echo "   The database tables will be created automatically on first startup!"

