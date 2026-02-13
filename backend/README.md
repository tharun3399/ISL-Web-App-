# ISL Backend

Backend server for the ISL application with PostgreSQL integration.

## Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your PostgreSQL credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=isl_database
DB_USER=postgres
DB_PASSWORD=your_password
NODE_ENV=development
PORT=5000
```

4. Create the PostgreSQL database:
```bash
createdb isl_database
```

### Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Build

Build for production:
```bash
npm run build
```

### Endpoints

#### Health Check
- **GET** `/health` - Server health status

#### Database Check
- **GET** `/db-check` - Test database connection

#### Users API
- **GET** `/api/users` - Get all users
- **GET** `/api/users/:id` - Get user by ID
- **POST** `/api/users` - Create new user
- **PUT** `/api/users/:id` - Update user
- **DELETE** `/api/users/:id` - Delete user

### Example Requests

#### Create User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "passwordHash": "hashed_password"
  }'
```

#### Get All Users
```bash
curl http://localhost:5000/api/users
```

#### Update User
```bash
curl -X PUT http://localhost:5000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe"
  }'
```

#### Delete User
```bash
curl -X DELETE http://localhost:5000/api/users/1
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts       # PostgreSQL connection pool
│   ├── models/
│   │   └── User.ts           # User model and database operations
│   ├── routes/
│   │   └── users.ts          # User API routes
│   └── index.ts              # Main server file
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Technologies

- **Express.js** - Web framework
- **PostgreSQL** - Database
- **TypeScript** - Type safety
- **node-pg** - PostgreSQL client
- **dotenv** - Environment configuration
- **CORS** - Cross-origin resource sharing

## License

ISC
