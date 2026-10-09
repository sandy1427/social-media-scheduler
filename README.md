# Social Media Post Scheduler - Module 1 (User Authentication)

This is the first module of the Social Media Post Scheduler. It implements a fully functional User Authentication system using React, Node.js, Express, and MySQL.

## Project Structure

- `frontend/` - React Vite application
- `backend/` - Node.js Express application
- `database/` - MySQL schema

## Setup Instructions

### 1. Database Setup
1. Ensure MySQL is installed and running.
2. Create a database named `social_scheduler`.
3. Import the database schema:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure your MySQL credentials and JWT secret:
   ```bash
   cp .env.example .env
   ```
4. Start the backend server:
   ```bash
   node server.js
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Testing Guide

### 1. Register & Login
- Open `http://localhost:5173` in your browser.
- You will be redirected to the Login page. Click "Sign up" to create a new account.
- Fill in the registration form. Passwords must be at least 6 characters and match.
- Upon successful registration, you will be automatically logged in and redirected to the Dashboard.

### 2. Protected Routes (Dashboard & Profile)
- The **Dashboard** and **Profile** pages are protected routes.
- Try accessing `/dashboard` without logging in; you will be redirected to `/login`.
- While logged in, you can view the Dashboard placeholder for future modules.
- Navigate to "Profile" from the sidebar. You can update your Full Name here.
- You can also change your password by providing your current password and a new one.

### 3. Logout
- Click the "Logout" button at the bottom of the sidebar. You will be redirected to the login page and your session will be cleared.

### 4. Forgot / Reset Password
- Go to the Login page and click "Forgot password?".
- Enter the email you registered with.
- The system will generate a reset token. (For this module, it is printed directly in the UI for easy testing).
- Copy the token and click "Have a token? Reset here".
- Enter your email, the copied token, and a new password.
- Submit the form, then log in with your new password.

## Security Features Implemented
- Passwords are securely hashed with `bcrypt`.
- Authentication is handled using JSON Web Tokens (JWT).
- Environment variables are used for sensitive configurations.
- SQL injection protection via `mysql2` parameterized queries.
- Basic API Rate limiting on authentication routes to prevent brute-force attacks.
- Passwords and tokens are never returned in cleartext via API.
