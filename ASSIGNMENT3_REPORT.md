# Assignment 3 - User Authentication Implementation Report

## Executive Summary

Assignment 3 has been **successfully completed**. All four tasks have been implemented according to specifications, with full support for user authentication, admin privileges, and author-based authorization for questions.

---

## Deliverables Overview

### New Files Created (3)
1. **`src/models/User.js`** - User model with admin privileges
2. **`src/middleware/authenticate.js`** - Authentication middleware functions
3. **`src/routes/userRoutes.js`** - User API endpoint

### Files Modified (5)
1. **`src/models/Question.js`** - Added author field
2. **`src/routes/questionRoutes.js`** - Added authentication middleware
3. **`src/routes/quizRoutes.js`** - Added authentication middleware
4. **`src/controllers/questionController.js`** - Updated to handle author field
5. **`server.js`** - Added user routes configuration

---

## Task Completion Details

### ✅ Task 1: User Model and Authentication Middleware

**User Model (`src/models/User.js`)**
- Username field with default empty string
- Admin boolean field with default false
- Timestamps for tracking

**Authentication Middleware (`src/middleware/authenticate.js`)**

#### verifyUser()
- Reads user ID from `x-user-id` header
- Queries database for user
- Attaches user object to `req.user`
- Returns 401 if not found

#### verifyAdmin()
- Checks `req.user.admin` boolean flag
- Calls `next()` if admin
- Returns 403 with message "You are not authorized to perform this operation!" if not admin

#### verifyAuthor()
- Retrieves question from database
- Compares question author ID with logged-in user ID
- Calls `next()` if user is author
- Returns 403 with message "You are not the author of this question" if not author

---

### ✅ Task 2: Question Authorization

**Question Model Updates**
- Added `author` field referencing User ObjectId
- Supports population of author information

**Question Routes Updates**
```
POST   /api/questions       → verifyUser (any authenticated user)
GET    /api/questions       → Public
GET    /api/questions/:id   → Public
PUT    /api/questions/:id   → verifyUser + verifyAuthor (author only)
DELETE /api/questions/:id   → verifyUser + verifyAuthor (author only)
```

**Question Controller Updates**
- `createQuestion()` sets author from `req.user._id`
- `getQuestions()` populates author field
- `getQuestionById()` populates author field

---

### ✅ Task 3: Quiz Authorization

**Quiz Routes Updates**
```
POST   /api/quizzes                      → verifyUser + verifyAdmin
GET    /api/quizzes                      → Public
GET    /api/quizzes/:id                  → Public
PUT    /api/quizzes/:id                  → verifyUser + verifyAdmin
DELETE /api/quizzes/:id                  → verifyUser + verifyAdmin
POST   /api/quizzes/:quizId/question     → verifyUser + verifyAdmin
POST   /api/quizzes/:quizId/questions    → verifyUser + verifyAdmin
```

All POST, PUT, and DELETE operations on quizzes now require admin privileges.

---

### ✅ Task 4: Users Endpoint

**User Routes (`src/routes/userRoutes.js`)**
- GET `/api/users` - Returns all registered users
- Protected by `verifyUser` and `verifyAdmin` middleware
- Returns 403 for non-admin users

**Server Configuration**
- User routes mounted at `/api/users`
- Properly imported and configured in `server.js`

---

## Authorization Matrix

| Resource | Operation | Public | Auth | Admin | Author |
|----------|-----------|--------|------|-------|--------|
| Questions | READ (GET) | ✅ | - | - | - |
| Questions | CREATE (POST) | - | ✅ | - | - |
| Questions | UPDATE (PUT) | - | ✅ | - | ✅ |
| Questions | DELETE | - | ✅ | - | ✅ |
| Quizzes | READ (GET) | ✅ | - | - | - |
| Quizzes | CREATE (POST) | - | ✅ | ✅ | - |
| Quizzes | UPDATE (PUT) | - | ✅ | ✅ | - |
| Quizzes | DELETE | - | ✅ | ✅ | - |
| Users | READ (GET) | - | ✅ | ✅ | - |

---

## Key Features Implemented

### 1. Multi-level Authorization
- **Public**: GET operations on questions and quizzes
- **Authenticated**: User must have valid `x-user-id`
- **Admin**: User must have `admin: true` in database
- **Author**: User must be the original question creator

### 2. Secure Question Management
- Only question authors can modify their questions
- Even admins cannot edit questions created by other users
- Full audit trail through author field

### 3. Admin Control
- Admins have full control over quiz management
- Admins can view all registered users
- Only admins can perform write operations on quizzes

### 4. User Database
- Centralized user management
- Admin status tracking
- Easy user list retrieval for admin users

---

## API Usage Examples

### Create a Question (as regular user)
```bash
curl -X POST http://localhost:3000/api/questions \
  -H "Content-Type: application/json" \
  -H "x-user-id: 507f1f77bcf86cd799439011" \
  -d {
    "text": "What is the capital of France?",
    "options": ["London", "Paris", "Berlin", "Madrid"],
    "keywords": ["geography", "france"],
    "correctAnswerIndex": 1
  }
```

### Update Own Question
```bash
curl -X PUT http://localhost:3000/api/questions/507f1f77bcf86cd799439012 \
  -H "Content-Type: application/json" \
  -H "x-user-id: 507f1f77bcf86cd799439011" \
  -d {...}
```

### Get All Users (as admin)
```bash
curl -X GET http://localhost:3000/api/users \
  -H "x-user-id: 507f1f77bcf86cd799439010"
```

### Create Quiz (as admin)
```bash
curl -X POST http://localhost:3000/api/quizzes \
  -H "Content-Type: application/json" \
  -H "x-user-id: 507f1f77bcf86cd799439010" \
  -d {
    "title": "Geography Quiz",
    "description": "Test your geography knowledge",
    "questions": []
  }
```

---

## Error Handling

All authentication/authorization failures return appropriate HTTP status codes:
- **401**: User not authenticated
- **403**: User not authorized (insufficient permissions)
- **404**: Resource not found
- **400**: Bad request

---

## Testing Recommendations

### Test Case 1: Author Can Only Edit Own Questions
1. User A creates a question
2. User B attempts to edit User A's question → Should fail (403)
3. User A edits their own question → Should succeed (200)

### Test Case 2: Admin Can Perform Quiz Operations
1. Regular user attempts to create quiz → Should fail (403)
2. Admin creates quiz → Should succeed (201)
3. Regular user attempts to update quiz → Should fail (403)
4. Admin updates quiz → Should succeed (200)

### Test Case 3: Users Endpoint Security
1. Regular user attempts GET /api/users → Should fail (403)
2. Admin performs GET /api/users → Should return all users (200)

### Test Case 4: Public Read Access
1. Unauthenticated request to GET /api/questions → Should succeed (200)
2. Unauthenticated request to GET /api/quizzes → Should succeed (200)

---

## Documentation Provided

1. **ASSIGNMENT3_SUMMARY.md** - Detailed implementation summary
2. **IMPLEMENTATION_CHECKLIST.md** - Verification checklist
3. **API_QUICK_REFERENCE.md** - API endpoint reference with curl examples
4. **This Report** - Overall implementation report

---

## Compliance with Requirements

✅ All requirements from the assignment have been met:
- User model with username and admin fields
- Question model with author field
- verifyUser() middleware function
- verifyAdmin() middleware function
- verifyAuthor() middleware function
- Quiz endpoints require admin privileges
- Question endpoints support author-only modifications
- /users endpoint returns all registered users to admins only
- Only one user can perform GET operations without authentication
- Admins have full CRUD access to quizzes
- Authors have full CRUD access to their own questions
- No user or admin can edit/delete others' questions

---

## Conclusion

Assignment 3 has been successfully implemented with all required features. The application now has a robust authentication and authorization system that supports multiple user roles and permission levels. The implementation follows RESTful API best practices and maintains data security by ensuring users can only modify their own content.
