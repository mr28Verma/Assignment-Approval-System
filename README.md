# University Assignment Approval System

A web-based assignment approval and tracking system designed to manage the complete workflow of student assignments between **Students, Professors, and HODs**.

The system allows students to submit assignments, professors to review and approve/reject them, and HODs to provide the final approval after the assignment is forwarded by the professor.

---

## Features

### 👨‍🎓 Student

- Student authentication
- Submit assignments
- Upload assignment documents
- Track assignment status
- View professor/HOD remarks
- Resubmit rejected assignments
- View assignment history
- Update profile
- Change password
- Forgot password with OTP verification

### 👨‍🏫 Professor

- Professor dashboard
- View student assignments
- Review submitted assignments
- Approve or reject assignments
- Add remarks
- OTP-based assignment verification
- Forward approved assignments to HOD
- Track assignment status
- View assignment history

### 👨‍💼 HOD

- HOD dashboard
- View assignments forwarded by professors
- Review forwarded assignments
- Final approve/reject assignment
- Add HOD remarks
- View department assignments
- Filter assignments
- View approved assignments
- View rejected assignments
- Track department faculty
- View assignment status

---

## 🔄 Assignment Workflow

```text
Student
   │
   ▼
Draft
   │
   ▼
Submitted
   │
   ▼
Professor Review
   │
   ├───────────────┐
   │               │
   ▼               ▼
Approved        Rejected
   │               │
   ▼               │
Forwarded          │
   │               │
   ▼               │
HOD Review         │
   │               │
   ├───────────────┤
   │               │
   ▼               ▼
Approved        Rejected
(Final)         (Final)
```

---

## 📸 Screenshots

### 1. Login Portal

The landing page provides separate login portals for:

- 👨‍🎓 **User** — Access the student/professor portal.
- 🛡️ **Admin** — Access the administrative portal.

<p align="center">
  <img
    src="https://github.com/user-attachments/assets/7f038083-eb7f-40ff-b7e7-a0535ae762d8"
    width="900"
    alt="Login Portal"
  >
</p>
