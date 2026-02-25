# Hướng Dẫn Import và Sử Dụng Postman Collection

## Bước 1: Import Collection vào Postman

1. Mở **Postman**
2. Click nút **Import** ở góc trên bên trái
3. Chọn tab **File**
4. Click **Choose Files** và chọn file `Quiz-API-Postman-Collection.json`
5. Click **Import**

## Bước 2: Kiểm Tra Collection

Sau khi import, bạn sẽ thấy collection **"Quiz Application API - Assignment 3"** với các folder:

- 📁 **Authentication** (5 requests)
- 📁 **Questions** (6 requests)
- 📁 **Quizzes** (7 requests)
- 📁 **Users** (2 requests)

## Bước 3: Chuẩn Bị Database

Chạy lệnh để tạo test users:

```bash
node seeds.js
```

## Bước 4: Chạy Server

```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:3000`

## Bước 5: Test Theo Thứ Tự

### 🔐 Phase 1: Authentication

**1. Login - Regular User (John)**
- Folder: Authentication
- Request: "Login - Regular User (John)"
- Click **Send**
- ✅ Token sẽ tự động lưu vào biến `user_token`

**2. Login - Admin**
- Request: "Login - Admin"
- Click **Send**
- ✅ Token sẽ tự động lưu vào biến `admin_token`

**3. Login - Jane**
- Request: "Login - Jane"
- Click **Send**
- ✅ Token sẽ tự động lưu vào biến `jane_token`

**4. Get Current User**
- Request: "Get Current User"
- Click **Send**
- ✅ Sẽ trả về thông tin user đang login

**5. Register User**
- Request: "Register User"
- Có thể thay đổi email/username trong body
- Click **Send**

---

### 📝 Phase 2: Questions

**1. Get All Questions (Public)**
- Không cần authentication
- Click **Send**

**2. Create Question (Authenticated)**
- Sử dụng `user_token` (John)
- Click **Send**
- ✅ Question ID sẽ tự động lưu vào biến `question_id`

**3. Update Question (Author Only)**
- Sử dụng `user_token` (John - là author)
- Click **Send**
- ✅ Thành công vì John là author

**4. Update Question - Unauthorized (Should Fail)**
- Sử dụng `jane_token` (Jane - không phải author)
- Click **Send**
- ❌ Sẽ fail với error 403: "You are not the author of this question"

**5. Get Question by ID (Public)**
- Không cần authentication
- Click **Send**

**6. Delete Question (Author Only)**
- Sử dụng `user_token` (John)
- Click **Send**
- ✅ Thành công

---

### 📚 Phase 3: Quizzes

**1. Get All Quizzes (Public)**
- Không cần authentication
- Click **Send**

**2. Create Quiz (Admin Only)**
- Sử dụng `admin_token`
- Click **Send**
- ✅ Quiz ID sẽ tự động lưu vào biến `quiz_id`

**3. Create Quiz - Unauthorized (Should Fail)**
- Sử dụng `user_token` (regular user)
- Click **Send**
- ❌ Sẽ fail với error 403: "You are not authorized to perform this operation!"

**4. Update Quiz (Admin Only)**
- Sử dụng `admin_token`
- Click **Send**
- ✅ Thành công

**5. Add Question to Quiz (Admin Only)**
- Cần tạo question trước (Phase 2, step 2)
- Sử dụng `admin_token`
- Click **Send**

**6. Get Quiz by ID (Public)**
- Không cần authentication
- Click **Send**

**7. Delete Quiz (Admin Only)**
- Sử dụng `admin_token`
- Click **Send**

---

### 👥 Phase 4: Users

**1. Get All Users (Admin Only)**
- Sử dụng `admin_token`
- Click **Send**
- ✅ Trả về danh sách tất cả users

**2. Get All Users - Unauthorized (Should Fail)**
- Sử dụng `user_token` (regular user)
- Click **Send**
- ❌ Sẽ fail với error 403

---

## Biến Môi Trường (Environment Variables)

Collection đã tự động cấu hình các biến sau:

| Biến | Mô Tả | Tự Động Lưu |
|------|-------|-------------|
| `base_url` | http://localhost:3000 | ❌ |
| `user_token` | JWT token của John | ✅ |
| `admin_token` | JWT token của Admin | ✅ |
| `jane_token` | JWT token của Jane | ✅ |
| `user_id` | ID của John | ✅ |
| `admin_id` | ID của Admin | ✅ |
| `jane_id` | ID của Jane | ✅ |
| `question_id` | ID của question vừa tạo | ✅ |
| `quiz_id` | ID của quiz vừa tạo | ✅ |

## Test Credentials

```
Admin:
- Email: admin@quiz.com
- Password: admin123

John (Regular User):
- Email: john@example.com
- Password: john123

Jane (Regular User):
- Email: jane@example.com
- Password: jane123
```

## Kiểm Tra Authorization

### ✅ Test Cases Nên PASS:

1. ✅ Public GET requests (không cần token)
2. ✅ Login với credentials đúng
3. ✅ Create question với user token
4. ✅ Update/Delete question của chính mình
5. ✅ Admin create/update/delete quiz
6. ✅ Admin get all users

### ❌ Test Cases Nên FAIL (403):

1. ❌ Regular user create quiz
2. ❌ Regular user update quiz
3. ❌ Regular user delete quiz
4. ❌ Regular user get all users
5. ❌ User update/delete question của người khác
6. ❌ Admin update/delete question của người khác

## Tips

1. **Chạy theo thứ tự**: Chạy Authentication requests trước để lưu tokens
2. **Kiểm tra biến**: Click vào tab "Variables" ở collection để xem các biến đã được lưu
3. **Xem Response**: Kiểm tra tab "Body" để xem kết quả
4. **Kiểm tra Status**: 
   - 200/201 = Success
   - 401 = Unauthorized (chưa login)
   - 403 = Forbidden (không có quyền)
   - 404 = Not Found

## Troubleshooting

**Lỗi: "User not authenticated"**
- Chạy lại Login request để lấy token mới

**Lỗi: "Invalid or expired token"**
- Token hết hạn sau 24h, chạy lại Login

**Lỗi: "Question not found"**
- Tạo question mới trước khi test update/delete

**Lỗi: Connection refused**
- Kiểm tra server đã chạy chưa (`npm run dev`)

## Kết Quả Mong Đợi

Sau khi test xong tất cả requests, bạn sẽ verify được:

✅ User registration và login hoạt động  
✅ JWT authentication hoạt động  
✅ Author-only authorization cho questions  
✅ Admin-only authorization cho quizzes  
✅ Public access cho GET operations  
✅ Proper error messages cho unauthorized requests  

---

**Chúc bạn test thành công! 🚀**
