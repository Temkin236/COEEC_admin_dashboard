# API Contract Documentation

## Authentication Endpoints

### POST /api/auth/login
**Description**: Authenticate user and get access tokens

**Request Body**:
\`\`\`json
{
  "email": "admin@astu.edu.et",
  "password": "Admin@2025"
}
\`\`\`

**Response**:
\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@astu.edu.et",
    "role": "admin"
  }
}
\`\`\`

### POST /api/auth/refresh
**Description**: Refresh access token using refresh token

**Request Body**:
\`\`\`json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
\`\`\`

### GET /api/auth/me
**Description**: Get current user information
**Headers**: `Authorization: Bearer {token}`

---

## Content Management Endpoints

### GET /api/content/:type
**Description**: Fetch content by type (homepage, about, departments, news)
**Query Parameters**:
- `lang`: Language code (en, am, af)
- `page`: Page number
- `limit`: Items per page

### POST /api/content/:type
**Description**: Create new content
**Headers**: `Authorization: Bearer {token}`

**Request Body**:
\`\`\`json
{
  "title": "Welcome to COEEC",
  "description": "Content description",
  "language": "en",
  "status": "draft"
}
\`\`\`

### PUT /api/content/:type/:id
**Description**: Update content by ID

### DELETE /api/content/:type/:id
**Description**: Delete content by ID

---

## Staff Management Endpoints

### GET /api/staff
**Description**: Get paginated staff list
**Query Parameters**:
- `page`: Page number
- `limit`: Items per page
- `department`: Filter by department
- `search`: Search by name or email

**Response**:
\`\`\`json
{
  "items": [...],
  "total": 45,
  "page": 1,
  "limit": 10
}
\`\`\`

### GET /api/staff/:id
**Description**: Get staff details by ID

### POST /api/staff
**Description**: Create new staff member

**Request Body**:
\`\`\`json
{
  "firstName": "Abebe",
  "lastName": "Kebede",
  "email": "abebe.kebede@astu.edu.et",
  "title": "Professor",
  "department": "CSE",
  "bio": "Brief biography",
  "researchAreas": ["AI", "Machine Learning"]
}
\`\`\`

### PUT /api/staff/:id
**Description**: Update staff member

### DELETE /api/staff/:id
**Description**: Delete staff member

### POST /api/staff/:id/cv
**Description**: Upload staff CV
**Content-Type**: `multipart/form-data`

---

## Research Endpoints

### GET /api/research
**Description**: Get research projects

### POST /api/research
**Description**: Create new research project

### GET /api/research/publications
**Description**: Get publications

### POST /api/research/publications
**Description**: Add new publication

---

## Student & Alumni Endpoints

### GET /api/students
**Description**: Get student statistics

### GET /api/students/alumni
**Description**: Get alumni directory

---

## Downloads Endpoints

### GET /api/downloads
**Description**: Get downloadable files
**Query Parameters**:
- `category`: Filter by category

### POST /api/downloads
**Description**: Upload new file
**Content-Type**: `multipart/form-data`

---

## Contact Endpoints

### GET /api/contact
**Description**: Get contact form submissions

### PATCH /api/contact/:id/status
**Description**: Update message status

**Request Body**:
\`\`\`json
{
  "status": "responded"
}
\`\`\`

---

## Approval Endpoints

### GET /api/approval/pending
**Description**: Get all pending approvals

### POST /api/approval/:type/:id/approve
**Description**: Approve an item

**Request Body**:
\`\`\`json
{
  "comment": "Approved with minor edits"
}
\`\`\`

### POST /api/approval/:type/:id/reject
**Description**: Reject an item

---

## Analytics Endpoints

### GET /api/analytics/dashboard
**Description**: Get dashboard statistics

**Response**:
\`\`\`json
{
  "stats": {
    "totalStaff": 45,
    "totalResearch": 23,
    "totalStudents": 1242,
    "pendingApprovals": 5
  },
  "recentActivity": [...],
  "contentByStatus": [...],
  "visitorTrend": [...]
}
\`\`\`

### GET /api/analytics/visitors
**Description**: Get visitor statistics
**Query Parameters**:
- `startDate`: Start date
- `endDate`: End date

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request**:
\`\`\`json
{
  "error": "Validation error",
  "details": ["Email is required", "Password must be at least 8 characters"]
}
\`\`\`

**401 Unauthorized**:
\`\`\`json
{
  "error": "Authentication required"
}
\`\`\`

**403 Forbidden**:
\`\`\`json
{
  "error": "Insufficient permissions"
}
\`\`\`

**404 Not Found**:
\`\`\`json
{
  "error": "Resource not found"
}
\`\`\`

**500 Internal Server Error**:
\`\`\`json
{
  "error": "Internal server error"
}
\`\`\`
