# CertyHub - Backend API Reference Guide for Mobile App (Flutter)

This document provides a comprehensive guide to all backend API routes. This reference is designed for consumption by mobile app (Flutter) developers. 

All endpoints use JSON as the request/response payload format unless specified otherwise (e.g., file upload endpoints which use `multipart/form-data`).

---

## Table of Contents
1. [Authentication API](#1-authentication-api)
2. [Public Masters & Form Metadata API](#2-public-masters--form-metadata-api)
3. [Student Registration & Profiles API](#3-student-registration--profiles-api)
4. [Notifications API](#4-notifications-api)
5. [Certificate Verification & Management API](#5-certificate-verification--management-api)
6. [Fee & Payment Management API](#6-fee--payment-management-api)
7. [Enquiries (CRM) API](#7-enquiries-crm-api)
8. [Dashboard & Reports Analytics API](#8-dashboard--reports-analytics-api)
9. [User Management API](#9-user-management-api)
10. [Application Color Palette & Typography](#10-application-color-palette--typography)

---

## 1. Authentication API

### Authenticate User (Login)
* **Endpoint**: `POST /api/auth/login`
* **Access**: Public
* **Request Headers**:
  ```http
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "your_secure_password"
  }
  ```
* **Success Response** (200 OK):
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d5ec4b9b1d8b2c4c8d45a1",
      "username": "admin",
      "role": "Admin",
      "name": "System Administrator",
      "email": "admin@slogsolutions.com"
    }
  }
  ```
* **Error Response** (400 Bad Request / 403 Forbidden):
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

---

### Get Current User Profile
* **Endpoint**: `GET /api/auth/profile`
* **Access**: Private (Requires token)
* **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Success Response** (200 OK):
  ```json
  {
    "id": "60d5ec4b9b1d8b2c4c8d45a1",
    "username": "admin",
    "name": "System Administrator",
    "email": "admin@slogsolutions.com",
    "mobile": "9999999999",
    "address": "Main Tech Block, Slog Solutions Campus",
    "role": "Admin",
    "isActive": true
  }
  ```
* **Error Response** (401 Unauthorized):
  ```json
  {
    "error": "No token, authorization denied"
  }
  ```

---

### Logout User
* **Endpoint**: `POST /api/auth/logout`
* **Access**: Private (Requires token)
* **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Success Response** (200 OK):
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

---

## 2. Public Masters & Form Metadata API
These endpoints are unauthenticated and are primarily used to populate dropdown selections (Colleges, Technologies, Course Details, Branches) in forms like registration or inquiry.

### Get Public Branches
* **Endpoint**: `GET /api/masters/branch/public`
* **Access**: Public
* **Success Response** (200 OK):
  ```json
  [
    {
      "_id": "60d5ec4b9b1d8b2c4c8d45f1",
      "name": "Computer Science & Engineering"
    },
    {
      "_id": "60d5ec4b9b1d8b2c4c8d45f2",
      "name": "Information Technology"
    }
  ]
  ```

---

### Get Public Technologies
* **Endpoint**: `GET /api/masters/technology/public`
* **Access**: Public
* **Success Response** (200 OK):
  ```json
  [
    {
      "_id": "60d5ec4b9b1d8b2c4c8d45t1",
      "name": "Flutter Development",
      "note": "Mobile Application Development"
    },
    {
      "_id": "60d5ec4b9b1d8b2c4c8d45t2",
      "name": "Node.js & Express",
      "note": "Backend Web Development"
    }
  ]
  ```

---

### Get Public Course Details
Fetches active course offerings mapping technologies to durations.
* **Endpoint**: `GET /api/masters/coursedetail/public`
* **Access**: Public
* **Success Response** (200 OK):
  ```json
  [
    {
      "_id": "60d5ec4b9b1d8b2c4c8d45c1",
      "isActive": true,
      "technologyId": {
        "_id": "60d5ec4b9b1d8b2c4c8d45t1",
        "name": "Flutter Development",
        "note": "Mobile Application Development"
      },
      "durationId": {
        "_id": "60d5ec4b9b1d8b2c4c8d45d1",
        "value": 6,
        "unit": "month"
      },
      "price": 15000
    }
  ]
  ```

---

### Get Public Colleges
* **Endpoint**: `GET /api/masters/college/public`
* **Access**: Public
* **Success Response** (200 OK):
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

---

## 3. Student Registration & Profiles API

### Get Shareable Link Details
Retrieves pre-filled course and price parameters associated with a registration code/link.
* **Endpoint**: `GET /api/registration/links/public/:id`
* **Access**: Public
* **URL Parameters**:
  * `id`: The unique link ID string
* **Success Response** (200 OK):
  ```json
  {
    "_id": "60d5ec4b9b1d8b2c4c8d45d9",
    "price": 12000,
    "location": "Online / Remote",
    "isActive": true,
    "collegeId": {
      "_id": "60d5ec4b9b1d8b2c4c8d45a5",
      "collegeName": "State Institute of Technology",
      "shortForm": "SIT",
      "isActive": true
    },
    "courseDetailId": {
      "_id": "60d5ec4b9b1d8b2c4c8d45c1",
      "isActive": true,
      "technologyId": {
        "_id": "60d5ec4b9b1d8b2c4c8d45t1",
        "name": "Flutter Development",
        "isActive": true
      },
      "durationId": {
        "_id": "60d5ec4b9b1d8b2c4c8d45d1",
        "value": 6,
        "unit": "month",
        "isActive": true
      }
    }
  }
  ```
* **Error Response** (404 Not Found):
  ```json
  {
    "error": "Registration link is inactive or invalid"
  }
  ```

---

### Register a Student
Allows a student to register. Can be done publicly if a `linkId` is supplied, or privately by an authorized dashboard user.
* **Endpoint**: `POST /api/registration/register`
* **Access**: Public (if using `linkId`) OR Private (Requires token)
* **Request Headers**:
  * `Content-Type: multipart/form-data`
  * `Authorization: Bearer <JWT_TOKEN>` (Only if registration is from staff/admin dashboard, i.e., no `linkId` is passed)
* **Multipart Body Fields**:
  * `photo`: File (optional, JPEG/PNG image)
  * `linkId`: String (optional, if using the public registration link)
  * `name`: String (required)
  * `fatherName`: String (required)
  * `dob`: Date String "YYYY-MM-DD" (required)
  * `gender`: String (required, e.g., "Male", "Female")
  * `email`: String (required)
  * `phone`: String (required, exactly 10 digits)
  * `address`: String (required)
  * `branchId`: String (required, ID of selected branch)
  * `startDate`: Date String "YYYY-MM-DD" (required)
  * **If NOT using `linkId` (Admin flow)**:
    * `collegeId`: String (required)
    * `courseDetailId`: String (required)
    * `durationId`: String (required)
    * `totalFee`: Number (required)
    * `amountSubmitted`: Number (optional, initial fee payment)
    * `paymentType`: String (optional, e.g. "cash", "online", "cheque")
  * **If using `linkId` (Public link flow)**:
    * `feeChoice`: String (required, choose from: `"free"`, `"full"`, or `"partial"`)
* **Success Response** (201 Created):
  ```json
  {
    "message": "Student registered successfully",
    "registrationNo": "STP-2026-08-18-ABCDE",
    "student": {
      "registrationNo": "STP-2026-08-18-ABCDE",
      "name": "Jane Doe",
      "fatherName": "John Doe Senior",
      "dob": "2002-04-12T00:00:00.000Z",
      "gender": "Female",
      "email": "janedoe@gmail.com",
      "phone": "9876543210",
      "nationality": "Indian",
      "address": "456 Park Avenue, Dehradun",
      "photoUrl": "/uploads/photos/photo-1723961234567.png",
      "workingStatus": "student",
      "collegeId": "60d5ec4b9b1d8b2c4c8d45a5",
      "branchId": "60d5ec4b9b1d8b2c4c8d45f1",
      "courseDetailId": "60d5ec4b9b1d8b2c4c8d45c1",
      "durationId": "60d5ec4b9b1d8b2c4c8d45d1",
      "startDate": "2026-09-01T00:00:00.000Z",
      "totalFee": 12000,
      "isActive": true,
      "_id": "60d5ec4b9b1d8b2c4c8d45aa"
    }
  }
  ```

---

### Get All Registered Students
* **Endpoint**: `GET /api/registration/students`
* **Access**: Private (Requires token)
* **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Query Parameters**:
  * `page`: Integer (default: 1)
  * `limit`: Integer (default: 10)
  * `search`: String (searches name, registrationNo, email, phone)
  * `isActive`: Boolean string (`true`/`false`)
  * `collegeId`: String
  * `courseDetailId`: String
  * `all`: Boolean string (`true` to bypass pagination limit)
* **Success Response** (200 OK):
  ```json
  {
    "data": [
      {
        "_id": "60d5ec4b9b1d8b2c4c8d45aa",
        "registrationNo": "STP-2026-08-18-ABCDE",
        "name": "Jane Doe",
        "email": "janedoe@gmail.com",
        "phone": "9876543210",
        "collegeId": {
          "_id": "60d5ec4b9b1d8b2c4c8d45a5",
          "collegeName": "State Institute of Technology"
        },
        "branchId": {
          "_id": "60d5ec4b9b1d8b2c4c8d45f1",
          "name": "Computer Science & Engineering"
        },
        "courseDetailId": {
          "_id": "60d5ec4b9b1d8b2c4c8d45c1",
          "technologyId": {
            "name": "Flutter Development"
          },
          "durationId": {
            "value": 6,
            "unit": "month"
          }
        },
        "totalFee": 12000,
        "isActive": true
      }
    ],
    "total": 1,
    "page": 1,
    "pages": 1
  }
  ```

---

### Update Student Profile
* **Endpoint**: `PUT /api/registration/students/:id`
* **Access**: Private (Requires token)
* **Request Headers**:
  * `Content-Type: multipart/form-data`
  * `Authorization: Bearer <JWT_TOKEN>`
* **URL Parameters**:
  * `id`: The unique student ID string
* **Multipart Body Fields**: (All fields optional)
  * `photo`: File (updated JPEG/PNG image)
  * `name`, `fatherName`, `dob`, `gender`, `email`, `phone`, `address`, `nationality`, `workingStatus`, `collegeId`, `branchId`, `year`, `state`, `city`, `trainingType`, `courseDetailId`, `durationId`, `startDate`, `location`, `totalFee`, `isActive`
* **Success Response** (200 OK):
  ```json
  {
    "_id": "60d5ec4b9b1d8b2c4c8d45aa",
    "name": "Jane Updated Doe",
    "phone": "9876543210",
    "isActive": true
  }
  ```

---

### Delete a Student
* **Endpoint**: `DELETE /api/registration/students/:id`
* **Access**: Private (Requires token)
* **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Success Response** (200 OK):
  ```json
  {
    "message": "Student registration deleted successfully"
  }
  ```

---

## 4. Notifications API

### Get Student-Specific Notifications
Fetches notifications targeted to a student's college and course.
* **Endpoint**: `GET /api/notifications/student`
* **Access**: Public
* **Query Parameters**: (Provide either `email` OR `phone` to automatically resolve college and course, or pass them explicitly)
  * `email`: String (optional)
  * `phone`: String (optional)
  * `collegeId`: String (optional)
  * `courseDetailId`: String (optional)
* **Success Response** (200 OK):
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
* **Error Response** (404 Not Found):
  ```json
  {
    "error": "Student record not found."
  }
  ```

---

### Get All Portal Notifications
* **Endpoint**: `GET /api/notifications`
* **Access**: Private (Requires token)
* **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Success Response** (200 OK):
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
        "_id": "60d5ec4b9b1d8b2c4c8d45c1"
      },
      "sentBy": {
        "name": "System Administrator",
        "username": "admin"
      },
      "createdAt": "2026-08-18T10:30:00.000Z"
    }
  ]
  ```

---

### Create a Notification
* **Endpoint**: `POST /api/notifications`
* **Access**: Private (Requires token)
* **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "title": "Exam Announcement",
    "message": "The final certification assessment will take place next Friday.",
    "collegeId": "60d5ec4b9b1d8b2c4c8d45a5",
    "courseDetailId": "60d5ec4b9b1d8b2c4c8d45c1"
  }
  ```
* **Success Response** (201 Created):
  ```json
  {
    "_id": "60d5ec4b9b1d8b2c4c8d4611",
    "title": "Exam Announcement",
    "message": "The final certification assessment will take place next Friday.",
    "collegeId": {
      "_id": "60d5ec4b9b1d8b2c4c8d45a5",
      "collegeName": "State Institute of Technology"
    },
    "courseDetailId": {
      "_id": "60d5ec4b9b1d8b2c4c8d45c1"
    },
    "sentBy": {
      "name": "System Administrator"
    }
  }
  ```

---

### Delete a Notification
* **Endpoint**: `DELETE /api/notifications/:id`
* **Access**: Private (Requires token)
* **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Success Response** (200 OK):
  ```json
  {
    "message": "Notification deleted successfully"
  }
  ```

---

## 5. Certificate Verification & Management API

### Verify Certificate (Public Verification)
Useful for QR code scanners embedded in the Flutter app to retrieve certificate confirmation.
* **Endpoint**: `GET /api/certificates/verify/:certificateId`
* **Access**: Public
* **URL Parameters**:
  * `certificateId`: The certificate ID (e.g. `CERT-2026-X7Y8Z9`)
* **Success Response** (200 OK):
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
* **Error Response** (404 Not Found):
  ```json
  {
    "verified": false,
    "error": "Invalid Certificate ID: No matching certificate found"
  }
  ```

---

### List All Issued Certificates
* **Endpoint**: `GET /api/certificates`
* **Access**: Private (Requires token)
* **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Query Parameters**:
  * `page`: Integer (default: 1)
  * `limit`: Integer (default: 10)
  * `search`: String (searches certificate ID or student details)
  * `status`: String (options: `"Active"`, `"Revoked"`)
* **Success Response** (200 OK):
  ```json
  {
    "data": [
      {
        "_id": "60d5ec4b9b1d8b2c4c8d47aa",
        "certificateId": "CERT-2026-X7Y8Z9",
        "studentId": {
          "_id": "60d5ec4b9b1d8b2c4c8d45aa",
          "name": "Jane Doe",
          "registrationNo": "STP-2026-08-18-ABCDE",
          "email": "janedoe@gmail.com"
        },
        "courseDetailId": {
          "technologyId": {
            "name": "Flutter Development"
          }
        },
        "pdfUrl": "/uploads/certificates/CERT-2026-X7Y8Z9.pdf",
        "status": "Active",
        "issueDate": "2026-08-18T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pages": 1
  }
  ```

---

### Update Certificate Status or PDF
* **Endpoint**: `PUT /api/certificates/:id`
* **Access**: Private (Requires token)
* **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "status": "Revoked",
    "regenerate": false
  }
  ```
* **Success Response** (200 OK):
  ```json
  {
    "_id": "60d5ec4b9b1d8b2c4c8d47aa",
    "certificateId": "CERT-2026-X7Y8Z9",
    "status": "Revoked"
  }
  ```

---

### Delete Certificate
* **Endpoint**: `DELETE /api/certificates/:id`
* **Access**: Private (Requires token)
* **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Success Response** (200 OK):
  ```json
  {
    "message": "Certificate deleted and file removed successfully"
  }
  ```

---

## 6. Fee & Payment Management API

### List Students with Fee Balances
* **Endpoint**: `GET /api/fee/students`
* **Access**: Private (Requires token)
* **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Query Parameters**:
  * `page`, `limit`, `search`, `isActive`
* **Success Response** (200 OK):
  ```json
  {
    "data": [
      {
        "_id": "60d5ec4b9b1d8b2c4c8d45aa",
        "registrationNo": "STP-2026-08-18-ABCDE",
        "name": "Jane Doe",
        "totalFee": 12000,
        "college": "State Institute of Technology",
        "discountAmount": 1000,
        "totalToPay": 11000,
        "submittedFee": 5000,
        "remainingFee": 6000,
        "paymentStatus": "Pending",
        "courseName": "Flutter Development"
      }
    ],
    "total": 1,
    "page": 1,
    "pages": 1
  }
  ```

---

### List Installment Payments of a Student
* **Endpoint**: `GET /api/fee/installments/:studentId`
* **Access**: Private (Requires token)
* **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Success Response** (200 OK):
  ```json
  [
    {
      "_id": "60d5ec4b9b1d8b2c4c8d48bb",
      "studentId": "60d5ec4b9b1d8b2c4c8d45aa",
      "amount": 5000,
      "paymentType": "online",
      "paidOn": "2026-08-18T10:00:00.000Z"
    }
  ]
  ```

---

### Record an Installment Payment
* **Endpoint**: `POST /api/fee/installments`
* **Access**: Private (Requires token)
* **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
* **Request Body**: (Provide either `studentId` OR `registrationNo`)
  ```json
  {
    "registrationNo": "STP-2026-08-18-ABCDE",
    "amount": 3000,
    "paymentType": "cash",
    "paidOn": "2026-08-18"
  }
  ```
* **Success Response** (201 Created):
  ```json
  {
    "_id": "60d5ec4b9b1d8b2c4c8d48bc",
    "studentId": "60d5ec4b9b1d8b2c4c8d45aa",
    "amount": 3000,
    "paymentType": "cash",
    "paidOn": "2026-08-18T00:00:00.000Z"
  }
  ```

---

### Update Fee Installment Payment
* **Endpoint**: `PUT /api/fee/installments/:id`
* **Access**: Private (Requires token)
* **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "amount": 3500,
    "paymentType": "online"
  }
  ```
* **Success Response** (200 OK):
  ```json
  {
    "_id": "60d5ec4b9b1d8b2c4c8d48bc",
    "amount": 3500,
    "paymentType": "online"
  }
  ```

---

### Delete Installment Payment
* **Endpoint**: `DELETE /api/fee/installments/:id`
* **Access**: Private (Requires token)
* **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Success Response** (200 OK):
  ```json
  {
    "message": "Installment payment deleted successfully"
  }
  ```

---

### Apply or Update a Fee Discount
* **Endpoint**: `POST /api/fee/discounts`
* **Access**: Private (Requires token)
* **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "registrationNo": "STP-2026-08-18-ABCDE",
    "discountAmount": 1500
  }
  ```
* **Success Response** (200 OK):
  ```json
  {
    "_id": "60d5ec4b9b1d8b2c4c8d49cc",
    "studentId": "60d5ec4b9b1d8b2c4c8d45aa",
    "totalFee": 12000,
    "discountAmount": 1500,
    "totalToPay": 10500
  }
  ```

---

## 7. Enquiries (CRM) API

### Submit Public Inquiry
* **Endpoint**: `POST /api/enquiry/public`
* **Access**: Public
* **Request Headers**:
  ```http
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "name": "Alex Johnson",
    "phone": "9988776655",
    "email": "alex@gmail.com",
    "courseInterested": "Flutter App Development",
    "message": "I would like to query about the batch schedules."
  }
  ```
* **Success Response** (201 Created):
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

### List CRM Enquiries
* **Endpoint**: `GET /api/enquiry`
* **Access**: Private (Requires token)
* **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Query Parameters**:
  * `page`, `limit`, `search`, `status`
* **Success Response** (200 OK):
  ```json
  {
    "data": [
      {
        "_id": "60d5ec4b9b1d8b2c4c8d4a11",
        "name": "Alex Johnson",
        "phone": "9988776655",
        "status": "New"
      }
    ],
    "total": 1,
    "page": 1,
    "pages": 1
  }
  ```

---

### Update CRM Enquiry Status / Details
* **Endpoint**: `PUT /api/enquiry/:id`
* **Access**: Private (Requires token)
* **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "status": "Contacted",
    "message": "Spoke to student, joining next week."
  }
  ```
* **Success Response** (200 OK):
  ```json
  {
    "_id": "60d5ec4b9b1d8b2c4c8d4a11",
    "name": "Alex Johnson",
    "status": "Contacted"
  }
  ```

---

## 8. Dashboard & Reports Analytics API

### Get Dashboard Statistics
Returns aggregated metrics for top KPI cards and registration/payment charts.
* **Endpoint**: `GET /api/dashboard/stats`
* **Access**: Private (Requires token)
* **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Success Response** (200 OK):
  ```json
  {
    "cards": {
      "totalStudents": 156,
      "totalCourses": 12,
      "totalRevenue": 482000,
      "totalCertificates": 45
    },
    "charts": {
      "registrations": [
        {
          "date": "2026-07",
          "registrations": 14
        },
        {
          "date": "2026-08",
          "registrations": 22
        }
      ],
      "payments": [
        {
          "date": "2026-07",
          "amount": 45000
        },
        {
          "date": "2026-08",
          "amount": 62000
        }
      ]
    }
  }
  ```

---

### Get Date-Wise Fee Collection Report
* **Endpoint**: `GET /api/reports/date-wise-fee`
* **Access**: Private (Requires token)
* **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Query Parameters**:
  * `startDate`: Date String "YYYY-MM-DD" (optional)
  * `endDate`: Date String "YYYY-MM-DD" (optional)
  * `paymentType`: String (optional, e.g. `"all"`, `"online"`, `"cash"`)
* **Success Response** (200 OK):
  ```json
  [
    {
      "_id": "60d5ec4b9b1d8b2c4c8d48bb",
      "amount": 5000,
      "paymentType": "online",
      "paidOn": "2026-08-18T10:00:00.000Z",
      "studentId": {
        "_id": "60d5ec4b9b1d8b2c4c8d45aa",
        "name": "Jane Doe",
        "registrationNo": "STP-2026-08-18-ABCDE",
        "totalFee": 12000
      },
      "discountAmount": 1000,
      "totalToPay": 11000
    }
  ]
  ```

---

### Get Course Enrollments Student Count Report
* **Endpoint**: `GET /api/reports/course-students`
* **Access**: Private (Requires token)
* **Success Response** (200 OK):
  ```json
  [
    {
      "courseId": "60d5ec4b9b1d8b2c4c8d45c1",
      "courseName": "Flutter Development",
      "duration": "6 month(s)",
      "price": 15000,
      "studentCount": 38
    },
    {
      "courseId": "60d5ec4b9b1d8b2c4c8d45c2",
      "courseName": "Node.js & Express",
      "duration": "3 month(s)",
      "price": 10000,
      "studentCount": 12
    }
  ]
  ```

---

## 9. User Management API
*These endpoints are restricted to users with the Admin role and are used to manage staff/admin user accounts.*

### Create a User Account
* **Endpoint**: `POST /api/users`
* **Access**: Private (Requires token + Admin role)
* **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "username": "johndoe",
    "password": "TemporaryPassword123",
    "name": "John Doe",
    "email": "johndoe@slogsolutions.com",
    "mobile": "9876543211",
    "address": "Staff Quarters, Slog Solutions",
    "role": "Staff",
    "isActive": true
  }
  ```
* **Success Response** (201 Created):
  ```json
  {
    "_id": "60d5ec4b9b1d8b2c4c8d4b1a",
    "username": "johndoe",
    "name": "John Doe",
    "email": "johndoe@slogsolutions.com",
    "mobile": "9876543211",
    "address": "Staff Quarters, Slog Solutions",
    "role": "Staff",
    "isActive": true
  }
  ```

---

### Update User Account
* **Endpoint**: `PUT /api/users/:id`
* **Access**: Private (Requires token + Admin role)
* **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
* **URL Parameters**:
  * `id`: User ID to update
* **Request Body**: (All fields optional)
  ```json
  {
    "name": "John Updated Doe",
    "isActive": false
  }
  ```
* **Success Response** (200 OK):
  ```json
  {
    "_id": "60d5ec4b9b1d8b2c4c8d4b1a",
    "username": "johndoe",
    "name": "John Updated Doe",
    "isActive": false
  }
  ```

---

## 10. Application Color Palette & Typography

To ensure design consistency between the frontend web portal and the mobile Flutter application, the following design system tokens should be used. These colors are defined in HSL format within the application's global styles and map to Tailwind CSS design tokens.

### Theme Modes

#### Light Mode Colors
| Token Name | HSL Representation | Hex Code | Flutter Color Instance | Primary Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `primary` | `206 84% 63%` | `#54AFF6` | `Color(0xFF54AFF6)` | Buttons, active states, focus indicators, highlight accents |
| `background` | `0 0% 98%` | `#FAFAFA` | `Color(0xFFFAFAFA)` | Main page background |
| `foreground` | `240 10% 3.9%` | `#09090B` | `Color(0xFF09090B)` | High-contrast body text, primary headings |
| `card` | `0 0% 100%` | `#FFFFFF` | `Color(0xFFFFFFFF)` | Background for cards, form sections, and containers |
| `secondary` | `240 4.8% 95.9%` | `#F4F4F5` | `Color(0xFFF4F4F5)` | Subtle panels, secondary button background |
| `muted` | `40 6% 88%` | `#E2DED9` | `Color(0xFFE2DED9)` | Placeholder backgrounds, dividers, inactive states |
| `muted-foreground` | `240 3.8% 46.1%` | `#71717A` | `Color(0xFF71717A)` | Subtitles, disabled text labels, secondary text |
| `accent` | `27 37% 45%` | `#9C634C` | `Color(0xFF9C634C)` | Brand secondary highlights, warm brown tone alerts |
| `destructive` | `0 84.2% 60.2%` | `#EF4444` | `Color(0xFFEF4444)` | Warnings, errors, delete button actions |
| `border` / `input` | `0 0% 89.8%` | `#E5E5E5` | `Color(0xFFE5E5E5)` | Input field borders, thin table lines, grid dividers |

#### Dark Mode Colors
| Token Name | HSL Representation | Hex Code | Flutter Color Instance | Primary Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `primary` | `206 84% 63%` | `#54AFF6` | `Color(0xFF54AFF6)` | Same primary blue color for consistency |
| `background` | `240 10% 3.9%` | `#09090B` | `Color(0xFF09090B)` | Dark background canvas |
| `foreground` | `0 0% 98%` | `#FAFAFA` | `Color(0xFFFAFAFA)` | High-contrast white text |
| `card` | `240 10% 3.9%` | `#09090B` | `Color(0xFF09090B)` | Container panels overlaying backgrounds |
| `secondary` | `240 3.7% 15.9%` | `#27272A` | `Color(0xFF27272A)` | Dark mode secondary button/panel backgrounds |
| `muted` | `240 3.7% 15.9%` | `#27272A` | `Color(0xFF27272A)` | Muted panels and section separators |
| `muted-foreground` | `240 5% 64.9%` | `#A1A1AA` | `Color(0xFFA1A1AA)` | Secondary descriptions, placeholder labels |
| `accent` | `27 37% 45%` | `#9C634C` | `Color(0xFF9C634C)` | Copper accents in dark theme layouts |
| `destructive` | `0 62.8% 30.6%` | `#7F1D1D` | `Color(0xFF7F1D1D)` | Deep crimson red for dark mode errors |
| `border` / `input` | `240 3.7% 15.9%` | `#27272A` | `Color(0xFF27272A)` | Dark field borders and layout dividers |

---

### Typography (Fonts)
The application standardizes on two main Google Fonts:
* **Headers / Titles**: `Poiret One` (a highly elegant, thin, geometric art-deco style font).
  * Flutter Implementation: `GoogleFonts.poiretOne()`
* **Body / Forms**: `Quicksand` (a friendly, rounded sans-serif font).
  * Flutter Implementation: `GoogleFonts.quicksand()`
