
---

# NestJS Backend Authentication Service

## Overview
This project implements a user authentication system with **NestJS** and **Prisma**. It provides functionality for user registration, login (via email/password or biometric key), biometric key registration, and reset. The app uses **JWT-based authentication** to ensure secure communication.

## Features
- **Standard User Registration** (email and password)
- **Standard User Login** (email and password)
- **Biometric User Login**
- **Biometric Key Registration**
- **Biometric Key Reset**

## Table of Contents
1. [Installation Instructions](#installation-instructions)
2. [Environment Variables](#environment-variables)
3. [Folder Structure](#folder-structure)
4. [Postman API Collection](#postman-api-collection)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)

---

## Installation Instructions

### Prerequisites
- **Node.js** (version 16 or higher)
- **PostgreSQL** - The app uses PostgreSQL as the database.
  - Install PostgreSQL: [PostgreSQL Installation](https://www.postgresql.org/download/)
- **Yarn** - Used to manage dependencies.
  - Install Yarn: [Yarn Installation](https://yarnpkg.com/getting-started/install)

### Steps to Set Up

1. **Clone the repository**:
   ```bash
   git clone https://github.com/udexmickey/nestjs-backend-test.git
   cd nestjs-backend-auth
   ```

2. **Install dependencies**:
   ```bash
   yarn install
   ```

3. **Configure PostgreSQL**:
   - Make sure PostgreSQL is running on your local machine or a cloud instance.
   - Create a database (e.g., `nestjs_db`).

4. **Configure `.env` file**:
   - Create a `.env` file in the root directory and fill in the necessary environment variables:

---

## Environment Variables
Ensure the following environment variables are set correctly in your `.env` file:
- `DATABASE_URL`: URL for PostgreSQL connection (using the format: `postgresql://<user>:<password>@<host>:<port>/<db>`).
- `JWT_SECRET`: Secret key used for signing JWT tokens.
- `jwtExpiresTime`: Expiry time for JWT tokens (in seconds).
- `SALTROUNDS`: Number of rounds for hashing passwords.
- `PORT`: PORT Number you want the app/server to run on.

---

5. **Run Prisma Migrations**:
   ```bash
   npx prisma migrate dev
   ```

---

## Folder Structure

Here’s a breakdown of the project folder structure:

```
nestjs-backend-auth/
│
├── src/                        # Application source code
│   ├── auth/                   # Authentication module
│   │   ├── auth.service.ts     # Service for handling authentication logic
│   │   ├── auth.controller.ts  # Controller to expose authentication endpoints
│   │   ├── auth.module.ts      # NestJS module for auth
│   │   └── jwt.strategy.ts     # JWT strategy implementation
│   ├── user/                   # User management module
│   │   ├── user.service.ts     # Service for user operations
│   │   ├── user.controller.ts  # Controller to expose user-related endpoints
│   │   ├── user.module.ts      # NestJS module for user
│   ├── prisma/                 # Prisma-related files
│   │   ├── prisma.service.ts   # Prisma service for database access
│   │   └── prisma.module.ts    # Prisma module for initialization
│   ├── app.module.ts           # Root application module
│   └── main.ts                 # Entry point for the application
│
├── prisma/                     # Prisma schema and migration files
│   ├── schema.prisma           # Prisma schema file
│   └── migrations/             # Database migrations
│
├── .env                        # Environment variables configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Node.js dependencies and scripts
├── yarn.lock                   # Yarn lock file for dependency management
└── README.md                   # Project documentation
```

---

## Postman API Collection

To test and interact with the API endpoints, you can use the **Postman** collection provided for this project. The collection contains pre-configured requests for all the authentication routes, such as registration, login, and biometric actions.

- **Local Collection Link**: [NestJS Backend Authentication - Graphql Collection](http://localhost:3000/graphql)

---

## Running the Application

### Development
To run the app in development mode:
```bash
yarn start:dev
```

### Production
For production, build the app and run it:
```bash
yarn build
yarn start:prod
```

---

## Testing

To run the tests for the application:
```bash
yarn test
```

---

### Conclusion
This NestJS backend is designed for handling user authentication with both standard and biometric login methods. It is integrated with **PostgreSQL** for persistent storage and uses **JWT** for secure access. The **Postman** collection provides a convenient way to test all available endpoints.

If you have any further questions or issues, feel free to open an issue on the repository or reach out to the team!

---