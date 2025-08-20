# Firebase Setup Guide

## Bước 1: Cài đặt dependencies
```bash
npm install firebase zustand
```

## Bước 2: Tạo project Firebase
1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Vào Authentication > Sign-in method
4. Bật Google sign-in provider

## Bước 3: Lấy thông tin cấu hình
1. Vào Project Settings (⚙️)
2. Scroll xuống phần "Your apps"
3. Chọn web app hoặc tạo mới
4. Copy thông tin cấu hình

## Bước 4: Tạo file .env
Tạo file `.env` trong thư mục `client/` với nội dung:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Bước 5: Cấu hình Google OAuth
1. Vào Google Cloud Console
2. Chọn project Firebase
3. Vào APIs & Services > Credentials
4. Thêm domain vào Authorized domains

## Bước 6: Test
1. Chạy `npm run dev`
2. Vào trang Login
3. Click "Sign in with Google"
4. Kiểm tra popup Google sign-in

## Lưu ý:
- Đảm bảo domain được authorize trong Firebase
- Kiểm tra console để debug nếu có lỗi
- Restart dev server sau khi thêm file .env
