# Student Attendance Management System

A comprehensive web application for managing student attendance with React frontend and Laravel backend.

## Features

- Student Registration with subject enrollment (3-5 subjects required)
- Attendance Tracking
- User Authentication
- Responsive Design with Material-UI

## Tech Stack

**Frontend:**
- React.js
- Material-UI (MUI)
- React Router
- Axios for API calls
- React Toastify for notifications

**Backend:**
- Laravel 10
- MySQL Database
- RESTful API
- Eloquent ORM

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **PHP** (v8.1 or higher) - [Download here](https://www.php.net/downloads.php)
- **Composer** - [Download here](https://getcomposer.org/download/)
- **MySQL** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/)
- **Git** - [Download here](https://git-scm.com/downloads)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd attendance-system
```

### 2. Backend Setup (Laravel)

#### Navigate to backend directory
```bash
cd attendance-backend
```

#### Install PHP dependencies
```bash
composer update
```

#### Create environment file
```bash
cp .env.example .env
```

#### Configure your database in `.env` file
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=attendance
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

#### Generate application key
```bash
php artisan key:generate
```

#### Create database
Create a MySQL database named `attendance`

#### Run migrations
```bash
php artisan migrate
```

#### Seed the database with sample data
```bash
php artisan db:seed
```

#### Start Laravel development server
```bash
php artisan serve
```

The Laravel API will be available at `http://localhost:8000`

### 3. Frontend Setup (React)

#### Open a new terminal and navigate to frontend directory
```bash
cd attendance-frontend
```

#### Install Node.js dependencies
```bash
npm install
```

#### Start React development server
```bash
npm start
```

The React application will be available at `http://localhost:3000`

## Database Schema

### Tables

1. **users** - System users (admin, teachers)
2. **students** - Student information
3. **subjects** - Available subjects
4. **student_subjects** - Many-to-many relationship between students and subjects
5. **attendances** - Attendance records

### Relationships

- Students can enroll in multiple subjects (3-5 subjects required)
- Subjects can have multiple students
- Attendance is tracked per student per subject per date

## Seeded Data

The application comes with pre-seeded data for testing:

### Subjects
- Introduction to Computer Science
- Calculus I
- English Composition
- Physics I
- General Chemistry

### Admin User
- **Email:** admin@deakin.edu.au
- **Password:** password

### Teacher User
- **Email:** teacher@deakin.edu.au
- **Password:** password

## API Endpoints

### Students
- `GET /api/students` - Get all students with subjects
- `POST /api/students` - Create new student
- `GET /api/students/{id}` - Get student by ID
- `GET /api/students/subject/{subjectId}` - Get students by subject

### Subjects
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create new subject
- `GET /api/subjects/{id}` - Get subject by ID

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/subject/{subjectId}` - Get attendance by subject

## Usage Instructions

### 1. Access the Application
Open your browser and go to `http://localhost:3000`

### 2. Student Registration
1. Click "ADD NEW STUDENT" button
2. Fill in student details:
   - Full Name
   - Registration Number (must be unique)
   - Email (must be unique)
   - Phone Number
   - Select 3-5 subjects from the dropdown
3. Click "Register Student"

### 3. View Students
- All registered students are displayed in a table
- You can see their registration number, name, email, phone, and enrolled subjects

### 4. Mark Attendance
1. Navigate to "Mark Attendance" section
2. Select subject and date
3. Mark students as present/absent
4. Save attendance


### Common Issues

#### 1. Database Connection Error
- Verify MySQL is running
- Check database credentials in `.env` file
- Ensure database exists

#### 2. API Connection Error
- Verify Laravel server is running on port 8000
- Check CORS settings in Laravel
- Verify API base URL in React `.env` file

#### 3. Subjects Not Showing for Students
- Check if relationships are properly loaded in Laravel controller
- Verify the Student model has correct relationship definition
- Check browser console for API response structure


### Database Reset
If you need to reset the database:
```bash
php artisan migrate:fresh --seed
```

### Clear Application Cache
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

## File Structure

```
attendance-system/
├── backend/                 # Laravel Backend
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── ...
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   └── ...
│   ├── routes/
│   └── ...
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── public/
│   └── ...
└── README.md
```

## Development Notes

- The application uses Laravel Sanctum for API authentication
- Material-UI provides the component library for consistent styling
- Student-subject relationship uses a pivot table
- Attendance tracking includes date and subject context

