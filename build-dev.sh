#!/usr/bin/env bash

# Exit immediately if a command fails
set -e

# Set database environment variables
export NODE_ENV=test
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=test_user
export DB_PASS=password
export DB_NAME=postgres
export MIGRATION_PATH=dist/migration/**/*.js

# Install dependencies
npm install

# Build project
npm run build

# Check arguments for rebuilding the database and running tests
for var in "$@"; do
    if [[ "$var" == "rebuild-db" ]]; then
        echo "Resetting database and running migrations..."
        npm run migration:revert
        npm run migration:run
    elif [[ "$var" == "run-tests" ]]; then
        echo "Running tests..."
        npm run test
    fi
done
