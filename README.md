# University Assignment Approval System

A web-based assignment approval and tracking system designed to manage the complete lifecycle of university assignments between Students, Professors, HODs, and Admin.

The system allows students to submit assignments, Professors to review and approve or reject submissions, HODs to provide final approval, and Admins to manage users and departments.

---

## Live Demo

**Live Application:**

https://university-assignment-approval-system-pdoh.onrender.com/

The application uses a **single Login Portal** for both User and Admin authentication.

From the Login Portal, the user can select:

- User
- Admin

Users are redirected to their respective dashboard according to their role.

---

## Overview

The University Assignment Approval System provides a centralized platform for managing academic assignments.

Students can submit and track assignments, Professors can review and approve or reject submissions, and HODs can provide the final approval after an assignment has been forwarded by the Professor.

The Admin can manage departments and users through the Admin Dashboard.

The system maintains an Assignment Tracker that records status transitions, timestamps, and the user responsible for each update.

---

# Login System

The application uses a **single Login Portal** instead of separate Admin and User login pages.

```text
                    SINGLE LOGIN PORTAL
                           |
              +------------+------------+
              |                         |
              v                         v
            USER                      ADMIN
              |                         |
              v                         v
       User Credentials         Admin Credentials
              |                         |
              v                         v
        Role Verification        Admin Verification
              |                         |
       +------+------+             +----+
       |      |      |             |
       v      v      v             v
   Student Professor HOD      Admin Dashboard
   Dashboard Dashboard Dashboard
