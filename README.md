
# SoloQuest - Project Planner for Solo Developers

A project management tool designed specifically for solo developers to manage personal development projects.

## Features

- Project management with priorities and statuses
- Task tracking with Kanban-style board
- Project statistics and reporting
- Database persistence with PostgreSQL
- JWT authentication for secure access
- Docker containerization for easy deployment

## Setup Instructions

### Local Development

1. Clone the repository
2. Copy the `.env.example` file to `.env` and update values as needed
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```

### Using Docker Compose

1. Clone the repository
2. Copy the `.env.example` file to `.env` and update values as needed
   - **IMPORTANT**: Change the `VITE_JWT_SECRET` to a strong random string for security
3. Build and start the containers:
   ```
   docker-compose up -d
   ```
4. The application will be available at http://localhost:8080

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_DB_HOST | Database host | postgres |
| VITE_DB_PORT | Database port | 5432 |
| VITE_DB_NAME | Database name | solo_quest |
| VITE_DB_USER | Database user | postgres |
| VITE_DB_PASSWORD | Database password | postgres |
| VITE_JWT_SECRET | Secret key for JWT tokens | change_this_to_a_secure_random_string |
| VITE_JWT_EXPIRY | JWT token expiration time | 7d |
| VITE_ADMIN_EMAIL | Admin user email | admin@example.com |
| VITE_ADMIN_PASSWORD | Admin user password | strongpassword123 |

## First Time Setup

On first run, the application will:
1. Connect to the PostgreSQL database
2. Create necessary tables if they don't exist
3. Create an initial admin user using the credentials from environment variables

You can log in using the admin credentials specified in your `.env` file.

## Security Notes

- In production, always change the default JWT secret to a strong random string
- The admin password should be changed after the first login
- The JWT implementation uses a simplified approach for demonstration - for production use, consider using a dedicated JWT library

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- PostgreSQL
- Docker
