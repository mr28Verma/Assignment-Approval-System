# University Assignment Approval System

A web-based assignment approval and tracking system designed to manage the complete lifecycle of university assignments between Students, Professors, and HODs.

The system allows students to submit assignments, professors to review and approve or reject submissions, and HODs to provide the final approval after an assignment is forwarded by the professor.

---

## Live Demo

**Live Application:**  
https://university-assignment-approval-system-pdoh.onrender.com/

[Open Live Application](https://university-assignment-approval-system-pdoh.onrender.com/)

The deployed application provides separate Student and Admin portals for accessing the assignment management system.

---

## Overview

The University Assignment Approval System provides a centralized platform for managing academic assignments.

Students can submit and track assignments, Professors can review and approve or reject submissions, and HODs can provide the final approval after an assignment has been forwarded.

The system maintains an assignment tracker that records status transitions, timestamps, and the user responsible for each update.

---

## Roles and Responsibilities

### Student

- Student authentication
- Submit assignments
- Upload assignment documents
- Track assignment status
- View Professor and HOD remarks
- Resubmit assignments rejected by the Professor
- View assignment history
- Update profile
- Change password
- Reset forgotten password using OTP verification

### Professor

- Professor authentication
- Professor dashboard
- View student assignments
- Review submitted assignments
- Approve assignments
- Reject assignments
- Add remarks
- OTP-based assignment verification
- Forward approved assignments to HOD
- Track assignment status
- View assignment history

### HOD

- HOD authentication
- HOD dashboard
- View assignments forwarded by Professors
- Review forwarded assignments
- Provide final approval
- Reject assignments
- Add HOD remarks
- View department assignments
- Filter assignments
- View approved assignments
- View rejected assignments
- Monitor department faculty
- Track assignment status

---

## Assignment Workflow

```text
                              STUDENT
                                 |
                                 v
                               Draft
                                 |
                                 v
                             Submitted
                                 |
                                 v
                        PROFESSOR REVIEW
                         /            \
                        /              \
                       v                v
                  Approved          Rejected
                       |                |
                       |                v
                       |          Student Resubmission
                       |                |
                       |                v
                       |          Resubmitted
                       |                |
                       |                v
                       |          Professor Review
                       |                |
                       +<---------------+
                       |
                       v
                   Forwarded
                       |
                       v
                   HOD REVIEW
                   /        \
                  /          \
                 v            v
            Approved       Rejected
             (Final)        (Final)
```

### Complete Status Flow

```text
draft
  |
  v
submitted
  |
  v
Professor Review
  |
  +-----------------------------+
  |                             |
  v                             v
approved                     rejected
  |                             |
  |                             v
  |                       Student Resubmission
  |                             |
  |                             v
  |                        resubmitted
  |                             |
  |                             v
  |                       Professor Review
  |                             |
  +-----------------------------+
  |
  v
forwarded
  |
  v
HOD Review
  |
  +-------------------+
  |                   |
  v                   v
approved           rejected
(Final)            (Final)
```

### Status Meaning

| Status | Description |
|---|---|
| `draft` | Assignment is being prepared |
| `submitted` | Student has submitted the assignment |
| `approved` | Assignment approved at the current review stage |
| `rejected` | Assignment rejected at the current review stage |
| `resubmitted` | Student has resubmitted a previously rejected assignment |
| `forwarded` | Professor has approved and forwarded the assignment to the HOD |

The Assignment Tracker maintains the complete history of each assignment status change.

The first `approved` status represents Professor approval. After the Professor forwards the assignment, a subsequent `approved` status represents the HOD's final approval.

A Professor rejection allows the Student to review the remarks, make the required changes, and resubmit the assignment.

A rejection by the HOD represents the final decision of the approval workflow.

---

## Database Schema

The application uses MongoDB with Mongoose for database management.

### User Schema

```text
User
 |
 +-- name
 +-- email
 +-- password
 +-- phone
 +-- department
 +-- role
 |    |
 |    +-- Student
 |    +-- Professor
 |    +-- Hod
 |
 +-- profilePic
```

### Assignment Schema

```text
Assignment
 |
 +-- student_name
 +-- email
 +-- title
 +-- category
 |    |
 |    +-- assignment
 |    +-- report
 |    +-- thesis
 |    +-- presentation
 |
 +-- description
 +-- upload_path
 +-- download
 +-- submit
 +-- professor
 +-- status
 |    |
 |    +-- draft
 |    +-- submitted
 |    +-- approved
 |    +-- rejected
 |    +-- resubmitted
 |    +-- forwarded
 |
 +-- remark
```

### Assignment Tracker Schema

```text
Assignment Tracker
 |
 +-- assignmentId
 +-- studentEmail
 +-- currentStatus
 |
 +-- history
      |
      +-- status
      +-- timestamp
      +-- updatedBy
```

Example tracker history:

```text
draft
  |
  v
submitted
  |
  v
approved
  |
  v
forwarded
  |
  v
approved
```

For an assignment rejected by the Professor and subsequently resubmitted:

```text
draft
  |
  v
submitted
  |
  v
rejected
  |
  v
resubmitted
  |
  v
approved
  |
  v
forwarded
  |
  v
approved
```

The Assignment Tracker stores the complete history of each assignment status change.

### Department Schema

```text
Department
 |
 +-- department_name
 |    |
 |    +-- CS
 |    +-- EE
 |    +-- ME
 |    +-- PH
 |    +-- CH
 |    +-- AR
 |    +-- HI
 |
 +-- program_type
 |    |
 |    +-- UG
 |    +-- PG
 |    +-- Research
 |
 +-- department_address
```

---

## Technology Stack

### Backend

<p align="left">
  <img src="https://skillicons.dev/icons?i=nodejs,express,mongodb" height="45" alt="Backend Technologies">
</p>

- Node.js
- Express.js
- MongoDB
- Mongoose

### Frontend

<p align="left">
  <img src="https://skillicons.dev/icons?i=html,css,js" height="45" alt="Frontend Technologies">
</p>

- HTML5
- CSS3
- JavaScript
- EJS

### Authentication and Security

<p align="left">
  <img src="https://skillicons.dev/icons?i=js" height="45" alt="Authentication">
</p>

- JSON Web Token (JWT)
- bcrypt
- Cookie-based authentication
- Role-based authorization
- OTP verification

### File Management

<p align="left">
  <img src="https://skillicons.dev/icons?i=cloudinary" height="45" alt="Cloudinary">
</p>

- Multer
- Cloudinary

### Email Services

<p align="left">
  <img src="https://skillicons.dev/icons?i=nodejs" height="45" alt="Email Services">
</p>

- Nodemailer

### Database

<p align="left">
  <img src="https://skillicons.dev/icons?i=mongodb" height="45" alt="Database">
</p>

- MongoDB
- Mongoose

### Development Tools

<p align="left">
  <img src="https://skillicons.dev/icons?i=vscode,git,github" height="45" alt="Development Tools">
</p>

- Visual Studio Code
- Git
- GitHub

### Configuration

- dotenv

---

## Key Features

### Role-Based Authentication

The system provides separate access based on the user's role.

```text
                    Authentication
                          |
             +------------+------------+
             |            |            |
             v            v            v
          Student      Professor       HOD
             |            |            |
             v            v            v
        Student UI   Professor UI    HOD UI
```

### Assignment Tracking

Each assignment is associated with an Assignment Tracker containing:

- Assignment ID
- Student email
- Current status
- Status history
- Timestamp
- User responsible for the update

### Assignment Resubmission

If a Professor rejects an assignment, the Student can review the Professor's remarks, make the required changes, and resubmit the assignment.

```text
submitted
    |
    v
rejected
    |
    v
resubmitted
    |
    v
Professor Review
```

### OTP Verification

OTP verification is used for sensitive operations such as assignment approval and rejection.

### File Upload

Assignment documents and profile images are uploaded using Multer and stored using Cloudinary.

### Email Notifications

Nodemailer is used for:

- Password reset OTP
- Assignment verification OTP
- Assignment status notifications
- Assignment forwarding notifications

### Password Security

Passwords are hashed using bcrypt before being stored in the database.

---

## Screenshots

### 1. Login Portal

The landing page provides separate portals for User and Admin access.

<p align="center">
  <img
    src="https://github.com/user-attachments/assets/7f038083-eb7f-40ff-b7e7-a0535ae762d8"
    width="900"
    alt="Login Portal"
  >
</p>

### 2. User Login

The User Login page provides access for Students, Professors, and HODs using university credentials.

<p align="center">
  <img
    src="https://github-production-user-asset-6210df.s3.amazonaws.com/187727171/637667701-5fd44b54-dec7-4824-ae09-709f4b03acce.png"
    width="900"
    alt="User Login"
  >
</p>

### 3. Admin Login

<p align="center">
  <img
    src="https://github.com/user-attachments/assets/67d8ef87-7935-4cf5-bdcc-4b7fed11fa8c"
    width="900"
    alt="Admin Login"
  >
</p>

### 4. Admin Dashboard

<p align="center">
  <img
    src="https://github.com/user-attachments/assets/3bb6b5e4-9a30-40b1-813c-5d7bd4823728"
    width="900"
    alt="Admin Dashboard"
  >
</p>

### 5. Student Dashboard

<p align="center">
  <img
    src="https://github.com/user-attachments/assets/2859d4e5-7278-4a88-b6e0-8e142ae954dd"
    width="900"
    alt="Student Dashboard"
  >
</p>

### 6. Professor Dashboard

<p align="center">
  <img
    src="https://github.com/user-attachments/assets/4d48778d-2aa8-450e-8bd5-5c2bb1b82e4b"
    width="900"
    alt="Professor Dashboard"
  >
</p>

### 7. HOD Dashboard

<p align="center">
  <img
    src="https://github.com/user-attachments/assets/14f995dd-3109-4b3e-9a53-521b6f4a4210"
    width="900"
    alt="HOD Dashboard"
  >
</p>

### 8. Student Assignment Tracking

Students can track the current status and history of their assignments.

<p align="center">
  <img
    src="https://github.com/user-attachments/assets/badd5ea2-1386-47cf-96cf-363479be3fa0"
    width="900"
    alt="Student Assignment Tracking"
  >
</p>

### 9. Professor Assignment Review

Professors can review submitted assignments and perform approval or rejection actions.

<p align="center">
  <img
    src="https://github.com/user-attachments/assets/bbe3018e-dc72-4d8c-b4d4-88c69ec21e5d"
    width="700"
    alt="Professor Assignment Review"
  >
</p>

---

## Project Structure

```text
Assignment-Approval-System/
|
+-- config/
|   +-- connectDB.js
|   +-- generateOTP.js
|   +-- multer.js
|   +-- sendEmail.js
|
+-- controllers/
|   +-- user.js
|   +-- professor.js
|   +-- hod.js
|
+-- middleware/
|   +-- userAuth.js
|
+-- models/
|   +-- user.js
|   +-- assignment.js
|   +-- assignmentTraker.js
|   +-- department.js
|
+-- route/
|   +-- authRoute.js
|   +-- userRoute.js
|   +-- professorRoute.js
|   +-- hodRoute.js
|
+-- view/
|   +-- user/
|       +-- student/
|       +-- professor/
|       +-- hod/
|
+-- public/
|   +-- css/
|   +-- js/
|   +-- images/
|
+-- .env
+-- .gitignore
+-- hashPassword.js
+-- server.js
+-- package.json
+-- package-lock.json
+-- README.md
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/mr28Verma/Assignment-Approval-System.git
```

### 2. Navigate to the Project

```bash
cd Assignment-Approval-System
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000

MONGO_URI=your_mongodb_connection_string

JWT_KEY=your_jwt_secret

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_KEY=your_cloudinary_api_key
CLOUD_SECRET=your_cloudinary_api_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

Do not commit the `.env` file to GitHub.

---

## Running the Application

### Development

```bash
npm run dev
```

### Normal Start

```bash
node server.js
```

The application will be available at:

```text
http://localhost:3000
```

---

## Requirements

Before running the application, make sure the following are available:

- Node.js
- MongoDB or MongoDB Atlas
- Cloudinary account
- Email service for Nodemailer
- Required environment variables

---

## Security

The application implements:

- Password hashing using bcrypt
- JWT-based authentication
- Protected routes
- Role-based access control
- Cookie-based authentication
- OTP verification
- Environment variable protection
- Cloud-based file storage

---

## Future Improvements

- Real-time notifications
- Advanced assignment search
- Pagination
- Assignment analytics
- Improved audit logging
- Administrative user management
- Production deployment
- Automated email templates
- Detailed assignment reporting

---

## Author

**Saksham Verma**

GitHub: https://github.com/mr28Verma/Assignment-Approval-System

Live Application: https://assignment-approval-system-eight.vercel.app/

---

## License

This project was developed for educational and academic purposes.
