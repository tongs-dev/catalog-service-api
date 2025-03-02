# Catalog Service API

## Overview
The Catalog Service API is a NestJS-based app that manages services and their versions.
It is built using TypeORM with PostgreSQL as the database and supports full CRUD operations.

## Project Structure
TypeScript (`.ts`) files live in the `src` folder and after compilation are output as JavaScript (`.js`) in the `dist` folder.
The full folder structure of this app is explained below:

```json
├── src
│   ├── auth                      # Logic for handling authentication/authorization on secure API
│   │   ├──controller             # Auth controller for handling authentication-related operations
│   │   ├──entity                 # TypeORM Entity representing user table
│   │   ├──module                 # NestJS module for feature separation
│   │   ├──service                # NestJS service for handling auth logic
│   ├── controller                # Controllers for handling API requests
│   ├── dao                       # Data Access Objects for database operations
│   ├── dto                       # Data Transfer Objects (DTOs) for validation
│   ├── entity                    # TypeORM Entities representing database tables
│   ├── migration                 # TypeORM migrations for database schema changes
│   │   ├── auth                  # Auth specific migrations
│   │   ├── dev                   # Local development specific migrations
│   ├── module                    # NestJS modules for feature separation
│   ├── app.ts                    # Main application entry point
│   ├── data-source.ts            # Database connection configuration
├── test                          # Tests
│   ├── integration               # Integration tests
│   ├── unit                      # Unit tests
│   ├── util                      # Utility functions for testing
├── .env                          # Environment variables for local development
├── .nvmrc                        # Node version
├── build-dev.sh                  # Script to build project, run migrations, run tests
├── docker-start-containers.sh    # Script to start docker containers
├── docker-delete-containers.sh   # Script to delete docker containers
├── docker-compose.yml            # Docker configuration for running services
├── ormconfig.js                  # TypeORM configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Project dependencies
└── README.md                     # Project documentation
```

##  Pre-reqs
To build and run this app locally you will need a few things:
- Node.js (v20)
- PostgreSQL (v15)
- Docker (For containerized setup)

## Getting started
1. Clone the repository
```bash
git clone https://github.com/tongs-dev/catalog-service-api.git
cd catalog-service-api
```

2. Start / close postgres server using docker
```bash
./docker-start-containers.sh
./docker-delete-containers.sh
```

## Building the project
Build and run project tests using a one-stop script `./build-dev.sh`
**Install dependencies & Build project**
```bash
./build-dev.sh
```
**Rebuild the Database & Run Migrations**
```bash
./build-dev.sh rebuild-db
```
**Run All Unit & Integration Tests**
```bash
./build-dev.sh run-tests
```
**Run ITs / UTs**
```bash
npm run test:it
npm run test:unit
```

## Running the app
1. Run the application
```bash
./build-dev.sh rebuild-db
npm run start
```

2. Navigate to `http://localhost:3000` and you should see the template being served and rendered locally!
API Endpoints
```
- Service Endpoints: 
GET /services - Retrieve all services
GET /services/:id/versions - Retrieve a service and its versions
POST /services - Create a new service
PATCH /services/:id - Update a service
DELETE /services/:id - Delete a service

- Version Endpoints
POST /versions - Create a version
GET /versions/:id - Retrieve a version
PUT /versions/:id - Update a version
DELETE /versions/:id - Delete a version
```

## Running migrations
**Create new migration file**
```bash
npm run migration:create ${filePath}/${fileName}
```
**Show migration files**
```bash
npm run migration:show
```
**Run migration files**
```bash
npm run migration:run
```
**Revert migration files**
```bash
npm run migration:revert
```

## Integrating authentication/authorization on the API
This project defines a secure API (http://localhost:3000/api/secure-resources) that uses JWT-based authentication to protect endpoints.
If an unauthenticated request is made, the API will return:
```json
{"statusCode":401,"message":"Unauthorized"}
```
Below is a guide on how to request resources.

1. User Registration
Before authenticating, users must register.
```bash
ENCRYPTED_PWD=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}' | jq -r '.password')

echo "Hashed Password: $ENCRYPTED_PWD"
```
This creates a new user and stores the hashed password.

2. Login
Registered users can authenticate to receive a JWT token using username and password.
```bash
ACCESS_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "$(ENCRYPTED_PWD)"}' | jq -r '.access_token')

echo "Token: $ACCESS_TOKEN"
```
Now, `$ACCESS_TOKEN` contains the JWT token.

3. Use the Token in Requests
```bash
curl -X GET http://localhost:3000/api/secure-resources \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```
This sends the token as a Bearer Token in the request.

### Auth Code structure
All authentication logic is located in the `/src/auth` folder, ensuring separation from other business logic.
