# CertyHub Frontend Routes & API Documentation

Welcome to the CertyHub frontend documentation. This guide maps out all the routes, pages, and dynamic screens in the frontend, along with the corresponding backend REST API endpoints. It is designed to assist mobile developers in replicating the website's functionalities and screen flows within a native or cross-platform mobile application.

---

## 1. Application Routing Architecture

The CertyHub web application uses a hybrid routing setup:

1. **Public Website (Next.js App Router):** The public-facing marketing pages (Home, About, Courses, Verify, etc.) are built using Next.js App Router for optimal SEO and performance. They are hosted under `frontend/src/app/(corporate)`.
2. **Admin/Staff Portal (React Router SPA):** The secure dashboard is embedded inside a Next.js catch-all route (`/dashboard/[[...route]]`). It dynamically loads a Single Page Application (SPA) driven by React Router (`react-router-dom`), configured in `frontend/src/admin/AdminApp.jsx`.

> [!NOTE]
> For the mobile application, you can implement standard native navigation (e.g., React Navigation, GoRouter, or Swift/Kotlin Navigation) and treat the dashboard sub-pages as nested screens or tabs behind an authentication guard.

---

## 2. Frontend Routes Reference

### A. Public Website Routes (Next.js)

These pages are accessible by anyone without authentication:

| Web Route Path | Page Component Path | Description | Associated Actions / API Integrations |
| :--- | :--- | :--- | :--- |
| `/` | `src/app/(corporate)/page.tsx` | Home page detailing services, stats, technologies, and a quick contact form. | `POST /api/enquiry/public` (Quick Enquiry)<br>`GET /api/masters/technology/public` (Tech sectors) |
| `/about` | `src/app/(corporate)/about/page.tsx` | Informational page showcasing CertyHub's vision, mission, and mentors. | None |
| `/courses` | `src/app/(corporate)/courses/page.tsx` | Lists all available courses, categories, durations, and admission details. | `GET /api/masters/coursedetail/public` |
| `/defence` | `src/app/(corporate)/defence/page.tsx` | Specialized services and training courses for the defence sector. | None |
| `/development` | `src/app/(corporate)/development/page.tsx` | Details regarding software, web, and custom systems development. | None |
| `/faq` | `src/app/(corporate)/faq/page.tsx` | Frequently Asked Questions. | None |
| `/mentors` | `src/app/(corporate)/mentors/page.tsx` | Directory of team members, instructors, and mentors. | None |
| `/outbound` | `src/app/(corporate)/outbound/page.tsx` | Details about outdoor/experiential corporate team-building events. | None |
| `/training` | `src/app/(corporate)/training/page.tsx` | Training models (industrial training, college workshops, certifications). | None |
| `/verify` | `src/app/(corporate)/verify/page.tsx` | Verification entry page where users look up certificate/registration IDs. | None |
| `/verify/:id` | `src/app/(corporate)/verify/page.tsx` | Verification details for a specific certificate ID (supports direct URLs). | `GET /api/certificates/verify/:id`<br>Offers PDF download from `/api/certificates/verify/:id/pdf` |
| `/login` | `src/app/(admin)/login/page.tsx` | Portal login interface for administrators and staff members. | `POST /api/auth/login` |
| `/register` | `src/app/(admin)/register/page.tsx` | Enrolment portal for public student registrations. | `GET /api/registration/links/public/:id`<br>`GET /api/masters/branch/public`<br>`POST /api/registration/register` |

---

### B. Admin & Staff Portal Dashboard Routes (SPA)

These routes require authentication. The web client stores a JWT token in local storage and validates access. Staff roles have read/write access to operations, while Admin roles have access to master data configurations and database utilities.

All dashboard routes are prefixed with `/dashboard` and handled in `src/admin/AdminApp.jsx`:

| SPA Route Path | React Component | Access Role | Description | Core API Enpoints Used |
| :--- | :--- | :--- | :--- | :--- |
| `/dashboard` | `pages/Dashboard.jsx` | Staff / Admin | Main dashboard showing statistics (enrolment numbers, fee collection chart, pending alerts). | `GET /api/dashboard/stats` |
| `/dashboard/registration` | `pages/Registration.jsx` | Staff / Admin | Student database management: register new students, view profiles, and update status. | `GET /api/registration/students`<br>`PUT /api/registration/students/:id`<br>`DELETE /api/registration/students/:id`<br>`POST /api/registration/bulk-upload` |
| `/dashboard/course-links` | `pages/CourseLinks.jsx` | Staff / Admin | Generate custom shareable registration links with pre-set course, fees, and discount structures. | `GET /api/registration/links`<br>`POST /api/registration/links`<br>`DELETE /api/registration/links/:id` |
| `/dashboard/fees` | `pages/Fees.jsx` | Staff / Admin | Ledger and collection manager: record payments, edit installments, print receipts. | `GET /api/fee/students`<br>`GET /api/fee/installments/:studentId`<br>`POST /api/fee/installments`<br>`PUT /api/fee/installments/:id` |
| `/dashboard/discounts` | `pages/Discounts.jsx` | Staff / Admin | Create and manage active discount coupons/schemes. | `GET /api/fee/discounts`<br>`POST /api/fee/discounts`<br>`DELETE /api/fee/discounts/:id` |
| `/dashboard/enquiries` | `pages/Enquiries.jsx` | Staff / Admin | CRM lead log: view incoming enquiries from the site, add notes, update follow-up statuses. | `GET /api/enquiry`<br>`POST /api/enquiry`<br>`PUT /api/enquiry/:id` |
| `/dashboard/certificates` | `pages/Certificates.jsx` | Staff / Admin | Issue certificates: upload recipient lists, apply templates, generate QR codes, download PDF batches. | `GET /api/certificates`<br>`POST /api/certificates/upload`<br>`GET /api/certificates/templates`<br>`GET /api/certificates/batch/:batchId/download-zip` |
| `/dashboard/notifications` | `pages/Notifications.jsx` | Staff / Admin | Send notifications, push updates, or email alerts to registered students/staff. | `GET /api/notifications`<br>`POST /api/notifications`<br>`DELETE /api/notifications/:id` |
| `/dashboard/reports/*` | `pages/Reports.jsx` | Staff / Admin | Financial and academic analytics:<br>- `/reports/fee-collection`<br>- `/reports/date-wise-fee`<br>- `/reports/course`<br>- `/reports/course-students` | `GET /api/reports/fee-collection`<br>`GET /api/reports/date-wise-fee`<br>`GET /api/reports/courses`<br>`GET /api/reports/course-students` |
| `/dashboard/masters` | `pages/Masters.jsx` | **Admin Only** | Manage lookup master tables (Technologies, Course Durations, Branches, Colleges, Course Details). | `GET/POST/PUT/DELETE` under `/api/masters/*` (e.g. `/api/masters/technology`, `/api/masters/duration`) |
| `/dashboard/users` | `pages/Users.jsx` | **Admin Only** | Manage portal access users (create Staff accounts, reset passwords, toggle account status). | `GET /api/users`<br>`POST /api/users`<br>`PUT /api/users/:id` |
| `/dashboard/backup` | `pages/Backup.jsx` | **Admin Only** | Database maintenance utilities: run MongoDB manual backups, view backups list, download dumps. | `GET /api/backup` (Admin endpoints)<br>`POST /api/backup` (Admin endpoints) |

---

## 3. Exhaustive Backend API Routes Reference

For all authenticated requests, you must pass the JWT token in the headers:
```http
Authorization: Bearer <JWT_TOKEN>
```

### 1. Authentication & Profiling (`/api/auth`)
Handles authentication logins and session identification for Staff and Admins.
* **`POST /api/auth/login`** `[Public]`
  * Authenticate user credentials and return JWT bearer token and user object metadata.
* **`GET /api/auth/profile`** `[Private - Staff & Admin]`
  * Retrieve profile fields (username, email, role, isActive) of the currently authenticated token owner.
* **`POST /api/auth/logout`** `[Private - Staff & Admin]`
  * Acknowledges session termination (token disposal is done client-side).

### 2. User & Employee Accounts (`/api/users`)
* **`GET /api/users`** `[Private - Admin Only]`
  * Fetch lists of all system users. Supports filtering by search terms or active flags.
* **`POST /api/users`** `[Private - Admin Only]`
  * Create a new employee portal account (name, email, role, username, password).
* **`PUT /api/users/:id`** `[Private - Admin Only]`
  * Update employee details (isActive status, role, email, password update).
* **`DELETE /api/users/:id`** `[Private - Admin Only]`
  * Delete a user account from database.

### 3. Student Registrations (`/api/registration`)
* **`GET /api/registration/students`** `[Private - Staff & Admin]`
  * Read students enrollment database. Supports queries for `search` strings, `page` number, and `limit` counts.
* **`POST /api/registration/register`** `[Public]`
  * Create a student profile. Accepts profile image upload under key `photo`. Requires course IDs, background info, and links fields.
* **`PUT /api/registration/students/:id`** `[Private - Staff & Admin]`
  * Edit existing registration files. Accepts image changes under multipart key `photo`.
* **`DELETE /api/registration/students/:id`** `[Private - Staff & Admin]`
  * Delete a registered student.
* **`POST /api/registration/students/bulk-toggle`** `[Private - Staff & Admin]`
  * Active/deactive a payload list of student database rows in one call.
* **`POST /api/registration/students/bulk-delete`** `[Private - Admin Only]`
  * Permanently purge selected list of student IDs.
* **`POST /api/registration/students/toggle-all`** `[Private - Admin Only]`
  * Bulk toggle active status for all filtered search matching profiles.
* **`POST /api/registration/students/delete-all`** `[Private - Admin Only]`
  * Clear matches or whole collections for cleanup campaigns.
* **`GET /api/registration/links`** `[Private - Staff & Admin]`
  * Fetch custom payment/enrolment links prepared for marketing.
* **`GET /api/registration/links/public/:id`** `[Public]`
  * Fetch metadata associated with a pre-configured course link to render the custom public signup screen.
* **`POST /api/registration/links`** `[Private - Staff & Admin]`
  * Generate custom course link with preset course detail streams, fee configurations, and active status limits.
* **`POST /api/registration/links/bulk-toggle`** `[Private - Staff & Admin]`
  * Activate or disable groups of marketing link configurations.
* **`PUT /api/registration/links/:id`** `[Private - Staff & Admin]`
  * Edit configurations on generated enrollment codes.
* **`DELETE /api/registration/links/:id`** `[Private - Staff & Admin]`
  * Remove course links records.
* **`GET /api/registration/template-excel`** `[Private - Staff & Admin]`
  * Retrieve the template binary sheet (`.xlsx`) layout for bulk uploading student listings.
* **`POST /api/registration/bulk-upload`** `[Private - Staff & Admin]`
  * Upload custom Excel worksheets (`excelFile`) to insert many student records instantly.

### 4. Fee Installments & Ledgers (`/api/fee`)
* **`GET /api/fee/students`** `[Private - Staff & Admin]`
  * Retrieve registration profiles with summarized ledgers (Total Course Fees, Paid Fees, Pending Fees, Last Payment Dates).
* **`GET /api/fee/installments/:studentId`** `[Private - Staff & Admin]`
  * List all logged installment lines paid by a student.
* **`POST /api/fee/installments`** `[Private - Staff & Admin]`
  * Record a payment installment (amount, date, receiptNo, mode: cash/card/UPI, remarks).
* **`PUT /api/fee/installments/:id`** `[Private - Staff & Admin]`
  * Edit a fee payment receipt entry.
* **`DELETE /api/fee/installments/:id`** `[Private - Staff & Admin]`
  * Remove a payment entry and adjust student balance fields.
* **`GET /api/fee/discounts`** `[Private - Staff & Admin]`
  * Fetch list of available discount coupons and systems.
* **`POST /api/fee/discounts`** `[Private - Staff & Admin]`
  * Create a discount plan (name, type: flat/percentage, value).
* **`PUT /api/fee/discounts/:id`** `[Private - Staff & Admin]`
  * Edit a discount scheme properties.
* **`DELETE /api/fee/discounts/:id`** `[Private - Staff & Admin]`
  * Delete a discount plan.

### 5. Leads & Enquiries (`/api/enquiry`)
* **`POST /api/enquiry/public`** `[Public]`
  * Create enquiry logs from external landing forms (requires name, phone, courseInterested, message).
* **`GET /api/enquiry`** `[Private - Staff & Admin]`
  * Fetch database leads log with CRM statuses (New, In-Progress, Converted, Lost).
* **`POST /api/enquiry`** `[Private - Staff & Admin]`
  * Create a CRM enquiry manual entry.
* **`PUT /api/enquiry/:id`** `[Private - Staff & Admin]`
  * Update notes, representative agents, or CRM level codes on a lead.
* **`DELETE /api/enquiry/:id`** `[Private - Staff & Admin]`
  * Remove enquiry leads.

### 6. Certificate Verification & Creation (`/api/certificates`)
* **`GET /api/certificates`** `[Private - Staff & Admin]`
  * Read the list of generated certificates.
* **`PUT /api/certificates/:id`** `[Private - Staff & Admin]`
  * Edit a certificate record details.
* **`DELETE /api/certificates/:id`** `[Private - Staff & Admin]`
  * Delete a certificate.
* **`GET /api/certificates/templates`** `[Private - Staff & Admin]`
  * Read layout templates structures.
* **`POST /api/certificates/templates`** `[Private - Staff & Admin]`
  * Create a template structure.
* **`PUT /api/certificates/templates/:id`** `[Private - Staff & Admin]`
  * Edit a layout template.
* **`DELETE /api/certificates/templates/:id`** `[Private - Staff & Admin]`
  * Remove a layout template.
* **`GET /api/certificates/template-excel`** `[Private - Staff & Admin]`
  * Download standard structure Excel template.
* **`POST /api/certificates/upload`** `[Private - Staff & Admin]`
  * Upload template spreadsheets (`excelFile`) to batch create student certificates, generate signatures, and bind QR-code links.
* **`GET /api/certificates/batch/:batchId/download-zip`** `[Private - Staff & Admin]`
  * Triggers compression stream packing all PDFs issued in a batch into a download archive file.
* **`GET /api/certificates/download-all-zip`** `[Private - Staff & Admin]`
  * Pack and archive all certificates in the system database.
* **`POST /api/certificates/bulk-toggle`** `[Private - Admin Only]`
  * Bulk toggle certificates active/revoked flags.
* **`POST /api/certificates/bulk-delete`** `[Private - Admin Only]`
  * Bulk delete certificates records.
* **`GET /api/certificates/verify/:certificateId`** `[Public]`
  * Read validation parameters for credential lookups.
* **`GET /uploads/certificates/:filename`** `[Public]`
  * Serves the static PDF file. If the file is missing but exists in the database, the server dynamically lazy-generates the PDF with appropriate QR code signatures and saves/streams it.

### 7. Global Notifications (`/api/notifications`)
* **`GET /api/notifications`** `[Private - Staff & Admin]`
  * Read lists of sent message logs.
* **`POST /api/notifications`** `[Private - Staff & Admin]`
  * Create and broadcast custom message alerts (by email/SMS options).
* **`DELETE /api/notifications/:id`** `[Private - Staff & Admin]`
  * Delete notification logs.
* **`GET /api/notifications/student`** `[Public]`
  * Allow students to query for messages sent to them by using their email or mobile number queries.

### 8. Analytics & Financial Reports (`/api/reports`)
* **`GET /api/reports/fee-collection`** `[Private - Staff & Admin]`
  * Retrieve charts data and values of collected vs. outstanding accounts.
* **`GET /api/reports/date-wise-fee`** `[Private - Staff & Admin]`
  * Retrieve collections details grouped daily or in date filters.
* **`GET /api/reports/courses`** `[Private - Staff & Admin]`
  * Enrollment distribution counters mapped to distinct courses.
* **`GET /api/reports/course-students`** `[Private - Staff & Admin]`
  * Full list of registered candidates enrolled under a specific course ID.

### 9. Master Settings Directory (`/api/masters`)
Defines setup parameters for dropdown menus and lookup lists.
* **`GET /api/masters/technology/public`** `[Public]` | **`GET /api/masters/technology`** `[Private - Staff & Admin]`
  * Read lists of technology sectors (e.g. Java, Python Fullstack).
* **`POST/PUT/DELETE /api/masters/technology`** `[Private - Admin Only]`
  * Edit technologies configurations.
* **`GET /api/masters/duration/public`** `[Public]` | **`GET /api/masters/duration`** `[Private - Staff & Admin]`
  * Read standard duration periods (e.g. 6 Weeks, 6 Months).
* **`POST/PUT/DELETE /api/masters/duration`** `[Private - Admin Only]`
  * Edit standard periods durations.
* **`GET /api/masters/branch/public`** `[Public]` | **`GET /api/masters/branch`** `[Private - Staff & Admin]`
  * Read branches listings (e.g. CSE, ECE, ME).
* **`POST/PUT/DELETE /api/masters/branch`** `[Private - Admin Only]`
  * Create or update branches listing settings.
* **`GET /api/masters/college/public`** `[Public]` | **`GET /api/masters/college`** `[Private - Staff & Admin]`
  * Read colleges database settings.
* **`POST/PUT/DELETE /api/masters/college`** `[Private - Admin Only]`
  * Create/update colleges list (Accepts college logotype uploads in `logoImage`).
* **`GET /api/masters/coursedetail/public`** `[Public]` | **`GET /api/masters/coursedetail`** `[Private - Staff & Admin]`
  * Read detailed combinations of Technology, Duration, and Tuition Fees.
* **`POST/PUT/DELETE /api/masters/coursedetail`** `[Private - Admin Only]`
  * Setup detailed course models and standard pricing matrix.

### 10. Admin Stats (`/api/dashboard`)
* **`GET /api/dashboard/stats`** `[Private - Staff & Admin]`
  * Return metadata summaries for dashboard dashboard counters (total active registrations, total collection amount, total unpaid amount, recent lead logs).

### 11. Database Utilities (`/api/backup`)
* **`POST /api/backup/trigger`** `[Private - Admin Only]`
  * Instruct backend to run MongoDB dump utility and produce a zipped backup database image.
* **`GET /api/backup/list`** `[Private - Admin Only]`
  * View list of existing backup files.
* **`GET /api/backup/download/:filename`** `[Private - Admin Only]`
  * Stream database zipped dump archive.
* **`DELETE /api/backup/:filename`** `[Private - Admin Only]`
  * Remove backup archive files.

---

## 4. Mobile App Recommendations

1. **Authentication Token Storage:** Securely store the JWT token using device keychain/encrypted storage (e.g., `flutter_secure_storage` for Flutter, `expo-secure-store` for React Native, or iOS Keychain / Android EncryptedSharedPreferences).
2. **QR Code Scanning:** The app can implement a QR code scanner that targets the certificate page. Upon recognizing the pattern `https://<domain>/verify/<id>`, extract the ID, call `/api/certificates/verify/<id>`, and render the credential card in a native view rather than loading the webview.
3. **Offline Caching:** For staff who operate in areas with poor internet (e.g., college events), consider local offline logging for student lead collection (`/api/enquiry/public`), syncing data to the backend once connection is restored.
4. **PDF Viewer:** Use a native PDF renderer to display certificate previews directly inside the app using the `pdfUrl` returned by the verification endpoint.
