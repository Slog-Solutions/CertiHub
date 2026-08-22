# CertyHub - Student & Teacher API Guide for Mobile App (Flutter)

This reference guide documents all backend API endpoints required to implement the mobile application (Flutter) for **Student** and **Teacher** roles.

## General Information

- **Base URL**: `http://<your-server-ip-or-domain>:<port>`
- **Content Type**: All requests use `application/json` format unless specified otherwise (e.g., multipart form uploads).
- **Authentication**: Private endpoints require passing a JWT token in the HTTP authorization headers as:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```

---

## Table of Contents

1. [Shared Authentication & Profile APIs](#1-shared-authentication--profile-apis)
2. [Student Role APIs](#2-student-role-apis)
3. [Teacher Role APIs](#3-teacher-role-apis)
4. [Public Master Data APIs](#4-public-master-data-apis)

---

## 1. Shared Authentication & Profile APIs

### 1.1 Student Self-Registration (Sign Up)
Used by student users to self-create their credential accounts on the app.
- **Type**: `POST`
- **Endpoint**: `/api/auth/register-student`
- **Access**: Public
- **Request Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Payload**:
  ```json
  {
    "username": "jane_doe",
    "password": "secure_password_123",
    "name": "Jane Doe",
    "email": "janedoe@example.com",
    "mobile": "9876543210",
    "address": "456 Park Avenue, Dehradun"
  }
  ```
- **Success Response** (201 Created):
  ```json
  {
    "message": "Student account registered successfully",
    "user": {
      "id": "60d5ec4b9b1d8b2c4c8d4b1a",
      "username": "jane_doe",
      "name": "Jane Doe",
      "email": "janedoe@example.com",
      "mobile": "9876543210",
      "address": "456 Park Avenue, Dehradun",
      "role": "Student",
      "isActive": true
    }
  }
  ```
- **Error Response** (400 Bad Request):
  ```json
  {
    "error": "Username is already taken"
  }
  ```

### 1.2 User Login (Unified for Student & Teacher)
Authenticates a student or teacher and issues a JWT token.
- **Type**: `POST`
- **Endpoint**: `/api/auth/login`
- **Access**: Public
- **Request Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Payload**:
  ```json
  {
    "username": "jane_doe",
    "password": "secure_password_123"
  }
  ```
- **Success Response** (200 OK):
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d5ec4b9b1d8b2c4c8d45a1",
      "username": "jane_doe",
      "role": "Student", 
      "name": "Jane Doe",
      "email": "janedoe@example.com"
    }
  }
  ```
  *(Note: The `role` property in the response will indicate whether they are a `Student` or a `Teacher`.)*
- **Error Response** (400 Bad Request / 403 Forbidden):
  ```json
  {
    "error": "Invalid credentials"
  }
  ```
  *or*
  ```json
  {
    "error": "This account has been deactivated"
  }
  ```

### 1.3 Get Current User Profile
Retrieves the profile information of the currently authenticated user.
- **Type**: `GET`
- **Endpoint**: `/api/auth/profile`
- **Access**: Private (Requires token)
- **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
- **Success Response** (200 OK):
  ```json
  {
    "id": "60d5ec4b9b1d8b2c4c8d45a1",
    "username": "jane_doe",
    "name": "Jane Doe",
    "email": "janedoe@example.com",
    "mobile": "9876543210",
    "address": "456 Park Avenue, Dehradun",
    "role": "Student",
    "isActive": true
  }
  ```
- **Error Response** (401 Unauthorized):
  ```json
  {
    "error": "Request is not authorized"
  }
  ```

---

## 2. Student Role APIs

### 2.1 Get Enrolled Batches
Returns a list of all training batches the authenticated student has joined.
- **Type**: `GET`
- **Endpoint**: `/api/batches/student`
- **Access**: Private (Requires token + Student role)
- **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
- **Success Response** (200 OK):
  ```json
  [
    {
      "_id": "60d5ec4b9b1d8b2c4c8d49ee",
      "batchId": "FLUTTER-B1",
      "name": "Flutter Morning Batch",
      "teacherId": {
        "_id": "60d5ec4b9b1d8b2c4c8d45b2",
        "name": "Sarah Smith",
        "email": "sarah.smith@example.com"
      },
      "createdAt": "2026-08-18T10:30:00.000Z"
    }
  ]
  ```

### 2.2 Join a Batch
Allows a student to join a batch using a Batch ID and its Unique Key provided by their teacher.
- **Type**: `POST`
- **Endpoint**: `/api/batches/student/join`
- **Access**: Private (Requires token + Student role)
- **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
- **Request Payload**:
  ```json
  {
    "batchId": "FLUTTER-B1",
    "uniqueKey": "FLUT123"
  }
  ```
- **Success Response** (200 OK):
  ```json
  {
    "message": "Joined batch successfully",
    "batch": {
      "_id": "60d5ec4b9b1d8b2c4c8d49ee",
      "batchId": "FLUTTER-B1",
      "name": "Flutter Morning Batch"
    }
  }
  ```
- **Error Response** (400 Bad Request):
  ```json
  {
    "error": "Invalid Batch ID or Unique Key"
  }
  ```
  *or*
  ```json
  {
    "error": "You have already joined this batch"
  }
  ```

### 2.3 Get Batch Details
Retrieves details, classroom resource links, uploaded resource PDFs, and batch announcements for a specific batch.
- **Type**: `GET`
- **Endpoint**: `/api/batches/student/:id`
- **Access**: Private (Requires token + Student role)
- **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
- **URL Parameter**:
  - `id`: The unique database ID (`_id` field) of the batch.
- **Success Response** (200 OK):
  ```json
  {
    "_id": "60d5ec4b9b1d8b2c4c8d49ee",
    "batchId": "FLUTTER-B1",
    "name": "Flutter Morning Batch",
    "uniqueKey": "FLUT123",
    "teacherId": {
      "_id": "60d5ec4b9b1d8b2c4c8d45b2",
      "name": "Sarah Smith",
      "email": "sarah.smith@example.com"
    },
    "students": [
      "60d5ec4b9b1d8b2c4c8d45aa"
    ],
    "links": [
      {
        "title": "Google Meet Lecture Link",
        "url": "https://meet.google.com/abc-defg-hij",
        "date": "2026-08-18T10:30:00.000Z",
        "_id": "60d5ec4b9b1d8b2c4c8d49fa"
      }
    ],
    "pdfs": [
      {
        "title": "Flutter Basics PDF",
        "pdfUrl": "/uploads/pdfs/1723961234567-flutter_basics.pdf",
        "description": "Introduction to Flutter widgets and state management",
        "date": "2026-08-18T10:30:00.000Z",
        "_id": "60d5ec4b9b1d8b2c4c8d49fb"
      }
    ],
    "notifications": [
      {
        "title": "Assignment Submission",
        "message": "Submit your first Flutter project by Sunday evening.",
        "date": "2026-08-18T10:30:00.000Z",
        "_id": "60d5ec4b9b1d8b2c4c8d49fc"
      }
    ],
    "createdAt": "2026-08-18T10:30:00.000Z",
    "updatedAt": "2026-08-18T10:30:00.000Z"
  }
  ```
- **Error Response** (403 Forbidden):
  ```json
  {
    "error": "Access denied: You are not enrolled in this batch"
  }
  ```

### 2.4 Get Student-Specific Portal Announcements
Retrieves notifications published by administrators targeted to the student's specific college and course.
- **Type**: `GET`
- **Endpoint**: `/api/notifications/student`
- **Access**: Public
- **Query Parameters**:
  - `email`: String (optional) - resolves the student record to find their college and course.
  - `phone`: String (optional) - alternative resolver.
  - `collegeId`: String (optional) - direct filter if known.
  - `courseDetailId`: String (optional) - direct filter if known.
- **Success Response** (200 OK):
  ```json
  [
    {
      "_id": "60d5ec4b9b1d8b2c4c8d4610",
      "title": "Flutter Workshop Schedule",
      "message": "The online Flutter workshop is rescheduled to Saturday 3 PM.",
      "collegeId": {
        "_id": "60d5ec4b9b1d8b2c4c8d45a5",
        "collegeName": "State Institute of Technology"
      },
      "courseDetailId": {
        "_id": "60d5ec4b9b1d8b2c4c8d45c1",
        "technologyId": {
          "name": "Flutter Development"
        }
      },
      "createdAt": "2026-08-18T10:30:00.000Z"
    }
  ]
  ```
- **Error Response** (404 Not Found / 403 Forbidden):
  ```json
  {
    "error": "Student record not found."
  }
  ```
  *or*
  ```json
  {
    "error": "Access denied: student account is inactive."
  }
  ```

### 2.5 Verify Training Certificate (QR Code Scan)
Provides verification of a student's certificate. Ideal for integrating a QR code reader or manual verification module in the app.
- **Type**: `GET`
- **Endpoint**: `/api/certificates/verify/:certificateId`
- **Access**: Public
- **URL Parameter**:
  - `certificateId`: The certificate ID (e.g. `CERT-2026-X7Y8Z9`).
- **Success Response** (200 OK):
  ```json
  {
    "verified": true,
    "certificateId": "CERT-2026-X7Y8Z9",
    "studentName": "Jane Doe",
    "registrationNo": "STP-2026-08-18-ABCDE",
    "courseName": "Flutter Development",
    "duration": "6 month(s)",
    "issueDate": "2026-08-18T00:00:00.000Z",
    "status": "Active",
    "pdfUrl": "/uploads/certificates/CERT-2026-X7Y8Z9.pdf"
  }
  ```
- **Error Response** (404 Not Found):
  ```json
  {
    "verified": false,
    "error": "Invalid Certificate ID: No matching certificate found"
  }
  ```

### 2.6 Submit Public CRM Inquiry
Enables students to submit enquiry forms directly from the app.
- **Type**: `POST`
- **Endpoint**: `/api/enquiry/public`
- **Access**: Public
- **Request Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Payload**:
  ```json
  {
    "name": "Alex Johnson",
    "phone": "9988776655",
    "email": "alex@gmail.com",
    "courseInterested": "Flutter App Development",
    "message": "I would like to query about the batch schedules."
  }
  ```
- **Success Response** (201 Created):
  ```json
  {
    "_id": "60d5ec4b9b1d8b2c4c8d4a11",
    "name": "Alex Johnson",
    "phone": "9988776655",
    "email": "alex@gmail.com",
    "courseInterested": "Flutter App Development",
    "message": "I would like to query about the batch schedules.",
    "status": "New"
  }
  ```

---

## 3. Teacher Role APIs

### 3.1 Get Assigned Batches
Returns a list of all training batches assigned to the authenticated teacher, with enrolled student details.
- **Type**: `GET`
- **Endpoint**: `/api/batches/teacher`
- **Access**: Private (Requires token + Teacher role)
- **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
- **Success Response** (200 OK):
  ```json
  [
    {
      "_id": "60d5ec4b9b1d8b2c4c8d49ee",
      "batchId": "FLUTTER-B1",
      "name": "Flutter Morning Batch",
      "uniqueKey": "FLUT123",
      "teacherId": "60d5ec4b9b1d8b2c4c8d45b2",
      "students": [
        {
          "_id": "60d5ec4b9b1d8b2c4c8d45aa",
          "name": "Jane Doe",
          "username": "janedoe",
          "email": "jane@example.com",
          "mobile": "9876543210"
        }
      ],
      "links": [],
      "pdfs": [],
      "notifications": [],
      "createdAt": "2026-08-18T10:30:00.000Z",
      "updatedAt": "2026-08-18T10:30:00.000Z"
    }
  ]
  ```

### 3.2 Add Resource Link to Batch
Adds an online classroom URL or reference website link to the batch.
- **Type**: `POST`
- **Endpoint**: `/api/batches/teacher/:id/links`
- **Access**: Private (Requires token + Teacher role)
- **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
- **URL Parameter**:
  - `id`: Unique database ID of the batch.
- **Request Payload**:
  ```json
  {
    "title": "Zoom Lecture Session",
    "url": "https://zoom.us/j/1234567890"
  }
  ```
- **Success Response** (201 Created):
  ```json
  {
    "_id": "60d5ec4b9b1d8b2c4c8d49fa",
    "title": "Zoom Lecture Session",
    "url": "https://zoom.us/j/1234567890",
    "date": "2026-08-18T10:45:00.000Z"
  }
  ```

### 3.3 Upload PDF Resource to Batch
Uploads a course PDF document (up to 15MB) to the batch resources.
- **Type**: `POST`
- **Endpoint**: `/api/batches/teacher/:id/pdfs`
- **Access**: Private (Requires token + Teacher role)
- **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: multipart/form-data
  ```
- **URL Parameter**:
  - `id`: Unique database ID of the batch.
- **Multipart Form Payload**:
  - `title`: String (required) - Title of the PDF document.
  - `description`: String (optional) - Short detail or note about the document.
  - `pdf`: File (required) - Binary stream of the PDF file.
- **Success Response** (201 Created):
  ```json
  {
    "_id": "60d5ec4b9b1d8b2c4c8d49fb",
    "title": "Flutter Architecture and Lifecycle",
    "pdfUrl": "/uploads/pdfs/1723961234567-flutter_lifecycle.pdf",
    "description": "Explains WidgetsBinding and state transitions",
    "date": "2026-08-18T10:45:00.000Z"
  }
  ```

### 3.4 Add Batch Announcement (Notification)
Publishes an announcement notice to all students in the batch.
- **Type**: `POST`
- **Endpoint**: `/api/batches/teacher/:id/notifications`
- **Access**: Private (Requires token + Teacher role)
- **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
- **URL Parameter**:
  - `id`: Unique database ID of the batch.
- **Request Payload**:
  ```json
  {
    "title": "Assignment Deadline Extended",
    "message": "The state management assignment deadline has been extended to next Monday."
  }
  ```
- **Success Response** (201 Created):
  ```json
  {
    "_id": "60d5ec4b9b1d8b2c4c8d49fc",
    "title": "Assignment Deadline Extended",
    "message": "The state management assignment deadline has been extended to next Monday.",
    "date": "2026-08-18T10:45:00.000Z"
  }
  ```

### 3.5 Delete Batch Resource
Allows a teacher to delete a previously posted resource (link, PDF, or notification) from the batch.
- **Type**: `DELETE`
- **Endpoint**: `/api/batches/teacher/:id/resources/:type/:resourceId`
- **Access**: Private (Requires token + Teacher role)
- **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
- **URL Parameters**:
  - `id`: Unique database ID of the batch.
  - `type`: Must be exactly one of: `links`, `pdfs`, or `notifications`.
  - `resourceId`: The unique database ID (`_id`) of the resource item.
- **Success Response** (200 OK):
  ```json
  {
    "message": "Resource deleted successfully"
  }
  ```

---

## 4. Public Master Data APIs
Unauthenticated read-only endpoints used to populate forms (dropdown menus for registration, inquiries, etc.).

### 4.1 Get Branches
- **Type**: `GET`
- **Endpoint**: `/api/masters/branch/public`
- **Success Response** (200 OK):
  ```json
  [
    {
      "_id": "60d5ec4b9b1d8b2c4c8d45f1",
      "name": "Computer Science & Engineering"
    }
  ]
  ```

### 4.2 Get Technologies
- **Type**: `GET`
- **Endpoint**: `/api/masters/technology/public`
- **Success Response** (200 OK):
  ```json
  [
    {
      "_id": "60d5ec4b9b1d8b2c4c8d45t1",
      "name": "Flutter Development"
    }
  ]
  ```

### 4.3 Get Colleges
- **Type**: `GET`
- **Endpoint**: `/api/masters/college/public`
- **Success Response** (200 OK):
  ```json
  [
    {
      "_id": "60d5ec4b9b1d8b2c4c8d45a5",
      "collegeName": "State Institute of Technology",
      "shortForm": "SIT",
      "cityName": "Dehradun",
      "logoImageUrl": "/uploads/logos/Sit_logo.png"
    }
  ]
  ```

### 4.4 Get Active Courses
- **Type**: `GET`
- **Endpoint**: `/api/customCourses/public`
- **Success Response** (200 OK):
  ```json
  [
    {
      "_id": "60d5ec4b9b1d8b2c4c8d45c1",
      "name": "Flutter App Development",
      "description": "Comprehensive Flutter development boot camp.",
      "fees": "15000",
      "duration": "6 months",
      "image": "https://res.cloudinary.com/example/image/upload/v12345/course.jpg",
      "category": {
        "_id": "60d5ec4b9b1d8b2c4c8d45ca",
        "name": "Mobile Development"
      },
      "isActive": true
    }
  ]
  ```
