# API Implementation & Integration Guide for Flutter App
**Target Platforms:** Flutter iOS & Android Mobile Apps  
**Base URL:** `http://localhost:5000/api` (or Production Server Endpoint)  
**Authentication Scheme:** Bearer Token Header (`Authorization: Bearer <JWT_TOKEN>`)

---

## 1. Architectural Application Flow

```
                     ┌──────────────────────────┐
                     │   Flutter App Launch     │
                     └────────────┬─────────────┘
                                  │
                                  ▼
                     ┌──────────────────────────┐
                     │ Secure Storage Token     │
                     │      Check               │
                     └─────┬──────────────┬─────┘
                           │              │
                    Token  │              │ No Token
                    Valid  │              │
                           ▼              ▼
           ┌─────────────────────┐   ┌──────────────────────────┐
           │ Role-Based Routing  │   │  Login / Register Screen │
           └──────┬──────────┬───┘   │  (Role Toggle Pill Switch│
                  │          │       └────────────┬─────────────┘
                  │          │                    │
                  ▼          ▼                    │ Successful Auth
             Student        Teacher               │ (Returns Token & Role)
              Portal        Portal                ▼
                │              │       ┌──────────────────────────┐
                │              └───────┤ Save Token to Storage    │
                └──────────────────────┤ & Navigate to Portal     │
                                       └──────────────────────────┘
```

---

## 2. Shared Authentication Endpoints

### 2.1 User Login (Candidate / Expert)
Authenticates a student candidate or teacher instructor. Returns JWT token and user profile.

- **HTTP Method:** `POST`
- **Endpoint:** `/auth/login`
- **Headers:** `Content-Type: application/json`

#### Request Payload:
```json
{
  "username": "candidate_john",
  "password": "Password123"
}
```

#### Success Response (`200 OK`):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65e8a9b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "username": "candidate_john",
    "email": "john.doe@example.com",
    "role": "Student",
    "mobile": "9876543210",
    "address": "Dehradun, Uttarakhand"
  }
}
```

#### Error Response (`400 Bad Request` / `401 Unauthorized`):
```json
{
  "error": "Invalid username or password"
}
```

---

### 2.2 Student Candidate Registration
Public registration endpoint for new student candidates.

- **HTTP Method:** `POST`
- **Endpoint:** `/auth/register-student`
- **Headers:** `Content-Type: application/json`

#### Request Payload:
```json
{
  "username": "candidate_john",
  "password": "Password123",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "mobile": "9876543210",
  "address": "Dehradun, Uttarakhand"
}
```

#### Success Response (`201 Created`):
```json
{
  "message": "Student account registered successfully",
  "user": {
    "_id": "65e8a9b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "username": "candidate_john",
    "email": "john.doe@example.com",
    "role": "Student",
    "mobile": "9876543210",
    "address": "Dehradun, Uttarakhand",
    "isActive": true
  }
}
```

#### Error Response (`400 Bad Request`):
```json
{
  "error": "Username is already taken"
}
```

---

## 3. Student (Candidate) Portal Endpoints & Flow

### Student Application Step-by-Step Flow:
1. **Launch App**: Read stored token from Flutter Secure Storage. If valid, navigate to `StudentHomeScreen`.
2. **Fetch Enrolled Batches**: Call `GET /batches/student` to populate candidate's active course batches.
3. **Select Active Batch**: Call `GET /batches/student/:batchId` to load syllabus curriculum, announcements, study PDFs, and shared links.
4. **Join New Batch**: Provide `batchId` and `uniqueKey` passcode to `POST /batches/student/join`.
5. **View & Complete Curriculum**: View topics & subtopics checklist.
6. **Submit Assignments**: Call `GET /assignments/batch/:batchId` to view tasks, and `POST /assignments/:id/submit` to submit written solution or project URL.
7. **Submit Doubts / Queries**: Call `GET /queries/student?batchId=:id` to list questions, `POST /queries` to ask doubt, and `POST /queries/:id/reply` for follow-ups.
8. **Rate Course**: Call `POST /batches/student/:batchId/feedback` to rate (1-5 stars) and write course review.
9. **Push Alerts**: Save device FCM token via `PATCH /push/fcm-token` and fetch notifications via `GET /push/my-notifications`.

---

### 3.1 Fetch Candidate's Enrolled Batches
- **HTTP Method:** `GET`
- **Endpoint:** `/batches/student`
- **Headers:** `Authorization: Bearer <TOKEN>`

#### Success Response (`200 OK`):
```json
[
  {
    "_id": "65e8b1001122334455667788",
    "name": "Full Stack Web Development - Batch 1",
    "batchId": "FSWD-2026-B1",
    "uniqueKey": "SECURE99",
    "startDate": "2026-01-10T00:00:00.000Z",
    "endDate": "2026-06-30T00:00:00.000Z",
    "students": ["65e8a9b2c3d4e5f6a7b8c9d0"],
    "teachers": ["65e8a0000000000000000001"]
  }
]
```

---

### 3.2 Join New Course Batch
- **HTTP Method:** `POST`
- **Endpoint:** `/batches/student/join`
- **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`

#### Request Payload:
```json
{
  "batchId": "FSWD-2026-B1",
  "uniqueKey": "SECURE99"
}
```

#### Success Response (`200 OK`):
```json
{
  "message": "Successfully joined batch!",
  "batch": {
    "_id": "65e8b1001122334455667788",
    "name": "Full Stack Web Development - Batch 1",
    "batchId": "FSWD-2026-B1"
  }
}
```

---

### 3.3 Fetch Specific Batch Full Details
- **HTTP Method:** `GET`
- **Endpoint:** `/batches/student/:batchId`
- **Headers:** `Authorization: Bearer <TOKEN>`

#### Success Response (`200 OK`):
```json
{
  "_id": "65e8b1001122334455667788",
  "name": "Full Stack Web Development - Batch 1",
  "batchId": "FSWD-2026-B1",
  "notifications": [
    {
      "_id": "65e8c0011223344556677889",
      "title": "React Hooks Masterclass Live Session",
      "message": "Tomorrow live class starts at 10 AM IST. Please review State hooks.",
      "date": "2026-09-02T10:00:00.000Z"
    }
  ],
  "pdfs": [
    {
      "_id": "65e8c0021223344556677889",
      "title": "React Architecture & Patterns Guide",
      "description": "Complete PDF notes covering components, hooks, and state.",
      "pdfUrl": "https://example.com/uploads/react-guide.pdf",
      "date": "2026-09-01T08:00:00.000Z"
    }
  ],
  "links": [
    {
      "_id": "65e8c0031223344556677889",
      "title": "React Official Documentation",
      "url": "https://react.dev"
    }
  ],
  "curriculum": [
    {
      "_id": "65e8c0041223344556677889",
      "title": "Module 1: Modern JavaScript & ES6+",
      "description": "Arrow functions, destructuring, promises, async/await.",
      "order": 1,
      "isCompleted": true,
      "subtopics": [
        {
          "_id": "65e8c0051223344556677889",
          "title": "Promises and Async/Await",
          "isCompleted": true
        }
      ]
    }
  ]
}
```

---

### 3.4 Fetch Batch Assignments
- **HTTP Method:** `GET`
- **Endpoint:** `/assignments/batch/:batchId`
- **Headers:** `Authorization: Bearer <TOKEN>`

#### Success Response (`200 OK`):
```json
[
  {
    "_id": "65e8d0011223344556677889",
    "title": "Build a Responsive Dashboard Component",
    "description": "Create a modern SaaS dashboard UI with responsive grid columns.",
    "dueDate": "2026-09-10T23:59:59.000Z",
    "totalPoints": 100,
    "fileUrl": "https://example.com/uploads/assignment-guidelines.pdf",
    "submissions": [
      {
        "_id": "65e8d0021223344556677889",
        "studentId": "65e8a9b2c3d4e5f6a7b8c9d0",
        "answerText": "Implemented layout with 3-column desktop grid and fluid CSS.",
        "submissionUrl": "https://github.com/candidate/dashboard-app",
        "status": "Graded",
        "grade": 95,
        "feedback": "Excellent responsive design and dynamic data binding!",
        "submittedAt": "2026-09-03T05:00:00.000Z"
      }
    ]
  }
]
```

---

### 3.5 Submit Assignment Solution
- **HTTP Method:** `POST`
- **Endpoint:** `/assignments/:assignmentId/submit`
- **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`

#### Request Payload:
```json
{
  "answerText": "Implemented layout with 3-column desktop grid and fluid CSS.",
  "submissionUrl": "https://github.com/candidate/dashboard-app"
}
```

#### Success Response (`200 OK`):
```json
{
  "message": "Assignment submitted successfully!",
  "submission": {
    "studentId": "65e8a9b2c3d4e5f6a7b8c9d0",
    "answerText": "Implemented layout with 3-column desktop grid and fluid CSS.",
    "submissionUrl": "https://github.com/candidate/dashboard-app",
    "status": "Submitted",
    "submittedAt": "2026-09-03T12:00:00.000Z"
  }
}
```

---

### 3.6 Submit Doubt / Query to Expert Instructor
- **HTTP Method:** `POST`
- **Endpoint:** `/queries`
- **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`

#### Request Payload:
```json
{
  "batchId": "65e8b1001122334455667788",
  "topicId": "65e8c0041223344556677889",
  "topicTitle": "Module 1: Modern JavaScript & ES6+",
  "title": "How does async/await handle rejected promises?",
  "description": "I need clarification on try/catch blocks with async functions.",
  "priority": "High"
}
```

#### Success Response (`201 Created`):
```json
{
  "message": "Query submitted successfully!",
  "query": {
    "_id": "65e8e0011223344556677889",
    "batchId": "65e8b1001122334455667788",
    "studentId": "65e8a9b2c3d4e5f6a7b8c9d0",
    "studentName": "John Doe",
    "title": "How does async/await handle rejected promises?",
    "description": "I need clarification on try/catch blocks with async functions.",
    "status": "Pending",
    "priority": "High",
    "replies": [],
    "createdAt": "2026-09-03T12:30:00.000Z"
  }
}
```

---

### 3.7 Add Follow-up Message to Doubt Thread
- **HTTP Method:** `POST`
- **Endpoint:** `/queries/:queryId/reply`
- **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`

#### Request Payload:
```json
{
  "message": "Thank you! Could you also provide a code example for Promise.allSettled?"
}
```

#### Success Response (`200 OK`):
```json
{
  "message": "Reply added successfully",
  "reply": {
    "senderId": "65e8a9b2c3d4e5f6a7b8c9d0",
    "senderName": "John Doe",
    "senderRole": "Student",
    "message": "Thank you! Could you also provide a code example for Promise.allSettled?",
    "createdAt": "2026-09-03T12:45:00.000Z"
  }
}
```

---

### 3.8 Submit Course Review & Rating
- **HTTP Method:** `POST`
- **Endpoint:** `/batches/student/:batchId/feedback`
- **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`

#### Request Payload:
```json
{
  "rating": 5,
  "review": "Fantastic course! The instructor provided clear explanations and great assignments."
}
```

#### Success Response (`200 OK`):
```json
{
  "_id": "65e8f0011223344556677889",
  "batchId": "65e8b1001122334455667788",
  "studentId": "65e8a9b2c3d4e5f6a7b8c9d0",
  "studentName": "John Doe",
  "rating": 5,
  "review": "Fantastic course! The instructor provided clear explanations and great assignments.",
  "createdAt": "2026-09-03T13:00:00.000Z"
}
```

---

## 4. Teacher (Expert) Portal Endpoints & Flow

### Teacher Application Step-by-Step Flow:
1. **Launch App**: Verify stored JWT token role is `Teacher`. Navigate to `TeacherHomeScreen`.
2. **Fetch Assigned Batches**: Call `GET /batches/teacher` to load assigned instructor batches.
3. **Select Active Batch**: Call `GET /batches/teacher/:batchId` to load full batch state (enrolled candidate roster, curriculum progress, notifications, PDFs, links, reviews).
4. **Broadcast Announcement**: Call `POST /batches/teacher/:batchId/notifications` to send broadcast to all enrolled candidates.
5. **Upload Study PDF Link**: Call `POST /batches/teacher/:batchId/pdfs` to attach study material notes.
6. **Add Resource Link**: Call `POST /batches/teacher/:batchId/links` to share reference link.
7. **Manage Syllabus Curriculum**: Call `POST /batches/teacher/:batchId/curriculum` to add topics & subtopics.
8. **Mark Subtopic Completion**: Call `PATCH /batches/teacher/:batchId/curriculum/:topicId/subtopics/:subtopicId/complete`.
9. **Create & Grade Assignments**: Call `POST /assignments` to publish assignment, and `PATCH /assignments/:assignmentId/grade/:submissionId` to grade candidate solutions.
10. **Answer Candidate Doubts**: Call `GET /queries/teacher` to list candidate doubts, `POST /queries/:queryId/reply` to post expert answers, and `PATCH /queries/:queryId/status` to update status (`Answered`, `Resolved`).

---

### 4.1 Fetch Teacher's Assigned Batches
- **HTTP Method:** `GET`
- **Endpoint:** `/batches/teacher`
- **Headers:** `Authorization: Bearer <TOKEN>`

#### Success Response (`200 OK`):
```json
[
  {
    "_id": "65e8b1001122334455667788",
    "name": "Full Stack Web Development - Batch 1",
    "batchId": "FSWD-2026-B1",
    "uniqueKey": "SECURE99",
    "studentsCount": 24,
    "startDate": "2026-01-10T00:00:00.000Z"
  }
]
```

---

### 4.2 Fetch Full Teacher Batch Details (Includes Enrolled Candidates)
- **HTTP Method:** `GET`
- **Endpoint:** `/batches/teacher/:batchId`
- **Headers:** `Authorization: Bearer <TOKEN>`

#### Success Response (`200 OK`):
```json
{
  "_id": "65e8b1001122334455667788",
  "name": "Full Stack Web Development - Batch 1",
  "batchId": "FSWD-2026-B1",
  "uniqueKey": "SECURE99",
  "students": [
    {
      "_id": "65e8a9b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "username": "candidate_john",
      "email": "john.doe@example.com",
      "mobile": "9876543210"
    }
  ],
  "notifications": [],
  "pdfs": [],
  "links": [],
  "curriculum": []
}
```

---

### 4.3 Post Broadcast Announcement
- **HTTP Method:** `POST`
- **Endpoint:** `/batches/teacher/:batchId/notifications`
- **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`

#### Request Payload:
```json
{
  "title": "Weekend Hands-on Hackathon Alert",
  "message": "Join us this Saturday at 11 AM IST for a live coding sprint."
}
```

#### Success Response (`201 Created`):
```json
{
  "message": "Notification broadcasted successfully!",
  "notifications": [
    {
      "_id": "65e8c0011223344556677889",
      "title": "Weekend Hands-on Hackathon Alert",
      "message": "Join us this Saturday at 11 AM IST for a live coding sprint.",
      "date": "2026-09-03T14:00:00.000Z"
    }
  ]
}
```

---

### 4.4 Add Study PDF Material
- **HTTP Method:** `POST`
- **Endpoint:** `/batches/teacher/:batchId/pdfs`
- **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`

#### Request Payload:
```json
{
  "title": "Advanced React Patterns Handbook",
  "description": "Complete reference manual for context, reducers, and custom hooks.",
  "pdfUrl": "https://example.com/uploads/react-patterns.pdf"
}
```

#### Success Response (`201 Created`):
```json
{
  "message": "PDF material added successfully!",
  "pdfs": [
    {
      "_id": "65e8c0021223344556677889",
      "title": "Advanced React Patterns Handbook",
      "description": "Complete reference manual for context, reducers, and custom hooks.",
      "pdfUrl": "https://example.com/uploads/react-patterns.pdf",
      "date": "2026-09-03T14:15:00.000Z"
    }
  ]
}
```

---

### 4.5 Add Curriculum Topic & Subtopics
- **HTTP Method:** `POST`
- **Endpoint:** `/batches/teacher/:batchId/curriculum`
- **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`

#### Request Payload:
```json
{
  "title": "Module 2: State Management & Redux Toolkit",
  "description": "Store setup, reducers, actions, and thunk middleware.",
  "subtopics": [
    { "title": "Store & Slice Configuration" },
    { "title": "Async Thunk Operations" }
  ]
}
```

#### Success Response (`201 Created`):
```json
{
  "message": "Curriculum updated successfully",
  "curriculum": [
    {
      "_id": "65e8c0061223344556677889",
      "title": "Module 2: State Management & Redux Toolkit",
      "description": "Store setup, reducers, actions, and thunk middleware.",
      "order": 2,
      "isCompleted": false,
      "subtopics": [
        {
          "_id": "65e8c0071223344556677889",
          "title": "Store & Slice Configuration",
          "isCompleted": false
        }
      ]
    }
  ]
}
```

---

### 4.6 Mark Subtopic Completion Status
- **HTTP Method:** `PATCH`
- **Endpoint:** `/batches/teacher/:batchId/curriculum/:topicId/subtopics/:subtopicId/complete`
- **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`

#### Request Payload:
```json
{
  "isCompleted": true
}
```

#### Success Response (`200 OK`):
```json
{
  "message": "Subtopic completion status updated successfully!"
}
```

---

### 4.7 Create New Assignment
- **HTTP Method:** `POST`
- **Endpoint:** `/assignments`
- **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`

#### Request Payload:
```json
{
  "batchId": "65e8b1001122334455667788",
  "title": "Build a Responsive Dashboard Component",
  "description": "Create a modern SaaS dashboard UI with responsive grid columns.",
  "dueDate": "2026-09-10T23:59:59.000Z",
  "totalPoints": 100,
  "fileUrl": "https://example.com/uploads/assignment-guidelines.pdf"
}
```

#### Success Response (`201 Created`):
```json
{
  "_id": "65e8d0011223344556677889",
  "batchId": "65e8b1001122334455667788",
  "title": "Build a Responsive Dashboard Component",
  "description": "Create a modern SaaS dashboard UI with responsive grid columns.",
  "dueDate": "2026-09-10T23:59:59.000Z",
  "totalPoints": 100,
  "submissions": []
}
```

---

### 4.8 Grade Candidate Submission
- **HTTP Method:** `PATCH`
- **Endpoint:** `/assignments/:assignmentId/grade/:submissionId`
- **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`

#### Request Payload:
```json
{
  "grade": 95,
  "feedback": "Excellent responsive design and dynamic data binding!"
}
```

#### Success Response (`200 OK`):
```json
{
  "message": "Submission graded successfully!",
  "assignment": {
    "_id": "65e8d0011223344556677889",
    "title": "Build a Responsive Dashboard Component"
  }
}
```

---

### 4.9 Fetch Candidate Doubts Assigned to Expert
- **HTTP Method:** `GET`
- **Endpoint:** `/queries/teacher`
- **Headers:** `Authorization: Bearer <TOKEN>`

#### Success Response (`200 OK`):
```json
[
  {
    "_id": "65e8e0011223344556677889",
    "batchId": "65e8b1001122334455667788",
    "batchName": "Full Stack Web Development - Batch 1",
    "studentId": "65e8a9b2c3d4e5f6a7b8c9d0",
    "studentName": "John Doe",
    "title": "How does async/await handle rejected promises?",
    "description": "I need clarification on try/catch blocks with async functions.",
    "status": "Pending",
    "priority": "High",
    "replies": []
  }
]
```

---

### 4.10 Reply to Candidate Doubt Thread & Update Status
- **HTTP Method:** `POST`
- **Endpoint:** `/queries/:queryId/reply`
- **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`

#### Request Payload:
```json
{
  "message": "Async functions return a rejected Promise when an error is thrown inside try/catch."
}
```

#### Success Response (`200 OK`):
```json
{
  "message": "Reply added successfully",
  "reply": {
    "senderName": "Instructor Expert",
    "senderRole": "Teacher",
    "message": "Async functions return a rejected Promise when an error is thrown inside try/catch.",
    "createdAt": "2026-09-03T14:30:00.000Z"
  }
}
```

---

### 4.11 Update Doubt Status
- **HTTP Method:** `PATCH`
- **Endpoint:** `/queries/:queryId/status`
- **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`

#### Request Payload:
```json
{
  "status": "Answered"
}
```

#### Success Response (`200 OK`):
```json
{
  "message": "Status updated successfully",
  "query": {
    "_id": "65e8e0011223344556677889",
    "status": "Answered"
  }
}
```

---

## 5. Push Notifications & FCM Integration

### 5.1 Save Firebase FCM Device Token
- **HTTP Method:** `PATCH`
- **Endpoint:** `/push/fcm-token`
- **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`

#### Request Payload:
```json
{
  "fcmToken": "fcm_device_token_string_here..."
}
```

#### Success Response (`200 OK`):
```json
{
  "message": "FCM Token registered successfully"
}
```

---

### 5.2 Fetch Candidate Direct Push Notifications
- **HTTP Method:** `GET`
- **Endpoint:** `/push/my-notifications`
- **Headers:** `Authorization: Bearer <TOKEN>`

#### Success Response (`200 OK`):
```json
{
  "notifications": [
    {
      "title": "Assignment Graded",
      "message": "Your submission for Dashboard Component has been graded: 95/100.",
      "date": "2026-09-03T15:00:00.000Z",
      "read": false
    }
  ],
  "unreadCount": 1
}
```

---

## 6. HTTP Status Summary Table for Flutter Mobile Integration

| Status Code | Meaning | Flutter App Handling Strategy |
| :--- | :--- | :--- |
| **`200 OK`** | Request Successful | Process JSON body and update state / UI widgets. |
| **`201 Created`** | Resource Created | Show success snackbar / toast, pop modal, refresh list. |
| **`400 Bad Request`** | Validation / Client Error | Display error message banner from `res.data.error`. |
| **`401 Unauthorized`** | Missing / Expired Token | Clear secure storage token, redirect user to `LoginScreen`. |
| **`403 Forbidden`** | Role Mismatch | Alert user ("This account does not have access to this portal"). |
| **`404 Not Found`** | Resource Missing | Display empty state widget. |
| **`500 Server Error`** | Internal Server Fail | Display "Server error. Please try again later." |
