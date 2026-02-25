# Cách Tạo Admin User

## Đã Update: Register Endpoint Hỗ Trợ Tạo Admin

Bây giờ bạn có thể tạo admin user bằng cách thêm field `admin: true` vào request body khi register!

## Cách Sử Dụng

### 1. Register Regular User (Mặc Định)

**Endpoint:** `POST /api/auth/register`

**Body:**
```json
{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "password123"
}
```

**Kết quả:** User thường (admin: false)

---

### 2. Register Admin User

**Endpoint:** `POST /api/auth/register`

**Body:**
```json
{
    "username": "newadmin",
    "email": "newadmin@example.com",
    "password": "admin123",
    "admin": true
}
```

**Kết quả:** Admin user (admin: true)

---

## Test Trong Postman/Insomnia

### Tạo Request Mới:

1. **Method:** POST
2. **URL:** `http://localhost:3000/api/auth/register`
3. **Headers:**
   ```
   Content-Type: application/json
   ```
4. **Body (raw JSON):**
   ```json
   {
       "username": "superadmin",
       "email": "superadmin@quiz.com",
       "password": "super123",
       "admin": true
   }
   ```

### Response Mong Đợi:

```json
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "_id": "...",
        "username": "superadmin",
        "email": "superadmin@quiz.com",
        "admin": true
    }
}
```

---

## Lưu Ý Quan Trọng

### ⚠️ Security Warning

Trong production, bạn **KHÔNG NÊN** cho phép bất kỳ ai tạo admin user công khai như thế này!

**Giải pháp an toàn hơn:**

1. **Option 1:** Chỉ cho phép admin hiện tại tạo admin mới
   ```javascript
   // Thêm middleware verifyAdmin trước register route
   router.post('/register-admin', verifyUser, verifyAdmin, registerAdmin);
   ```

2. **Option 2:** Dùng secret key
   ```javascript
   if (admin === true && req.body.adminSecret !== process.env.ADMIN_SECRET) {
       return res.status(403).json({ message: 'Invalid admin secret' });
   }
   ```

3. **Option 3:** Tạo admin qua command line script
   ```javascript
   // scripts/create-admin.js
   const user = await User.create({
       username: 'admin',
       email: 'admin@example.com',
       password: 'password',
       admin: true
   });
   ```

### ✅ Cho Mục Đích Testing

Hiện tại implementation này OK cho testing và development. Nhưng nhớ bảo mật trước khi deploy production!

---

## Test Script

Chạy script test để verify:

```bash
node test-register-admin.js
```

Script sẽ:
1. ✅ Register admin user mới
2. ✅ Login với admin account
3. ✅ Tạo quiz để verify admin permissions
4. ✅ Confirm tất cả hoạt động đúng

---

## Các Trường Hợp Sử Dụng

### 1. Tạo Admin Đầu Tiên
```bash
POST /api/auth/register
{
    "username": "admin",
    "email": "admin@company.com",
    "password": "securepassword",
    "admin": true
}
```

### 2. Tạo Regular User
```bash
POST /api/auth/register
{
    "username": "john",
    "email": "john@company.com",
    "password": "password123"
    // admin field bỏ qua hoặc = false
}
```

### 3. Tạo Nhiều Admin
Lặp lại request với email khác nhau:
```json
{
    "username": "admin2",
    "email": "admin2@company.com",
    "password": "password",
    "admin": true
}
```

---

## Kiểm Tra Admin Status

Sau khi register, bạn có thể kiểm tra admin status bằng:

**GET /api/auth/me**
```
Authorization: Bearer <token>
```

Response sẽ có field `admin`:
```json
{
    "success": true,
    "user": {
        "_id": "...",
        "username": "superadmin",
        "email": "superadmin@quiz.com",
        "admin": true  // ← Kiểm tra field này
    }
}
```

---

## Summary

✅ **Đã implement:** Register endpoint hỗ trợ tạo admin  
✅ **Test passed:** Admin có thể tạo quiz  
✅ **Backward compatible:** Không ảnh hưởng đến user registration hiện tại  
⚠️ **Security note:** Cần bảo mật trước khi production  
