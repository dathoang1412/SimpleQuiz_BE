# Hướng Dẫn Fix Lỗi "<!DOCTYPE... is not valid JSON"

## Nguyên Nhân

Lỗi này xảy ra khi server trả về **HTML** thay vì **JSON**. Có thể do:

1. ✅ **Server chưa restart** sau khi update code
2. ✅ **Request headers sai** (Content-Type hoặc Authorization)
3. ✅ **Server crash** và trả về error page
4. ✅ **Route không đúng** (gọi sai endpoint)

## Giải Pháp

### Bước 1: Restart Server

**QUAN TRỌNG:** Sau khi update code, bạn PHẢI restart server!

```bash
# Dừng server hiện tại (Ctrl + C)
# Sau đó chạy lại:
npm run dev
```

Hoặc nếu dùng nodemon, nó sẽ tự restart. Kiểm tra terminal xem có log:

```
[nodemon] restarting due to changes...
[nodemon] starting `node server.js`
Server running at http://localhost:3000/questions
```

### Bước 2: Kiểm Tra Postman/Insomnia Request

#### ✅ Headers Phải Có:

```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

#### ✅ Body Format:

Chọn **raw** và **JSON**, không phải form-data hay x-www-form-urlencoded!

```json
{
    "title": "Test Quiz",
    "description": "This is a test quiz"
}
```

#### ✅ URL Đúng:

```
POST http://localhost:3000/api/quizzes
```

Không phải:
- ❌ `http://localhost:3000/quizzes` (thiếu /api)
- ❌ `http://localhost:3000/api/quiz` (thiếu s)

### Bước 3: Test Bằng Script Trước

Trước khi test bằng Postman, hãy test bằng script để chắc chắn server hoạt động:

```bash
node test-create-quiz.js
```

Nếu script chạy OK nhưng Postman lỗi → Vấn đề ở Postman config!

### Bước 4: Kiểm Tra Token

Token có thể hết hạn (24h). Hãy login lại để lấy token mới:

**Request:**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
    "email": "admin@quiz.com",
    "password": "admin123"
}
```

**Copy token từ response:**
```json
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {...}
}
```

Sau đó dùng token này trong header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Bước 5: Xem Server Logs

Khi gửi request từ Postman, xem terminal server có log gì không:

```bash
# Nếu thấy:
Error: ...
```

→ Có lỗi xảy ra, đọc error message để biết nguyên nhân

```bash
# Nếu không có log gì
```

→ Request không đến server, kiểm tra lại URL

### Bước 6: Test Với cURL (Alternative)

Nếu Postman vẫn lỗi, thử dùng PowerShell:

```powershell
# Login
$loginBody = @{
    email = "admin@quiz.com"
    password = "admin123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"

$token = $loginResponse.token

# Create Quiz
$quizBody = @{
    title = "Test Quiz"
    description = "Test Description"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/quizzes" -Method POST -Body $quizBody -Headers $headers
```

## Checklist Debug

- [ ] Server đã restart sau khi update code?
- [ ] URL đúng: `http://localhost:3000/api/quizzes`?
- [ ] Method đúng: `POST`?
- [ ] Header có `Content-Type: application/json`?
- [ ] Header có `Authorization: Bearer <token>`?
- [ ] Body format là **raw JSON**, không phải form-data?
- [ ] Token còn hạn (login trong vòng 24h)?
- [ ] Test script `node test-create-quiz.js` chạy OK?

## Nếu Vẫn Lỗi

### Kiểm Tra Response HTML

Nếu vẫn nhận được HTML, copy toàn bộ response và xem nội dung:

```html
<!DOCTYPE html>
<html>
<head>...</head>
<body>
    <h1>Error 401</h1>
    <p>User not authenticated</p>
</body>
</html>
```

→ Lỗi 401: Token sai hoặc thiếu  
→ Lỗi 403: Không có quyền (không phải admin)  
→ Lỗi 404: Route không tồn tại  
→ Lỗi 500: Server error  

### Xem Network Tab

Trong Postman/Insomnia:
1. Gửi request
2. Xem tab **Headers** trong response
3. Kiểm tra `Content-Type` header

Nếu là `text/html` → Server đang trả HTML  
Nếu là `application/json` → OK  

## Kết Luận

✅ **Server code đã OK** - test script chạy thành công  
✅ **Error handling đã được thêm** - server sẽ trả JSON cho tất cả API routes  
✅ **Vấn đề có thể ở Postman config** - kiểm tra lại headers và body format  

**Giải pháp nhanh nhất:**
1. Restart server: `npm run dev`
2. Login lại để lấy token mới
3. Kiểm tra headers trong Postman
4. Đảm bảo body format là **raw JSON**

---

**Nếu vẫn gặp vấn đề, hãy:**
1. Chụp screenshot request trong Postman (bao gồm URL, headers, body)
2. Copy toàn bộ error message
3. Copy server logs từ terminal
