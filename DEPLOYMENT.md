# Hướng dẫn triển khai (Deployment)

## Chuẩn bị môi trường

Trước khi triển khai, bạn cần chuẩn bị các biến môi trường trong file `.env` hoặc trên nền tảng hosting của bạn.

### Biến môi trường

Tạo file `.env` ở thư mục gốc của dự án với các biến sau:

```
VITE_BACKEND_URL=https://api.yourdomain.com           # URL API backend
VITE_FRONTEND_URL=https://yourdomain.com              # URL frontend
VITE_GOOGLE_CLIENT_ID=your-google-client-id           # Google Client ID
VITE_CALLBACK_URL=https://yourdomain.com/callback     # URL callback sau khi đăng nhập
VITE_GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google-callback  # URL callback Google
```

## Triển khai lên Netlify

### Bước 1: Chuẩn bị dự án

1. Đảm bảo đã commit tất cả thay đổi lên GitHub/GitLab.
2. Tạo file `netlify.toml` trong thư mục gốc:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Bước 2: Thiết lập trên Netlify

1. Tạo tài khoản và đăng nhập vào [Netlify](https://www.netlify.com/)
2. Nhấp vào "New site from Git"
3. Chọn GitHub/GitLab và chọn repository của bạn
4. Thiết lập như sau:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Thiết lập các biến môi trường trong phần "Advanced build settings"
6. Nhấn "Deploy site"

### Bước 3: Cấu hình tên miền

1. Đến phần "Domain settings"
2. Thêm tên miền tùy chỉnh của bạn
3. Làm theo hướng dẫn để cấu hình DNS

## Triển khai lên Vercel

### Bước 1: Chuẩn bị dự án

1. Đảm bảo đã commit tất cả thay đổi lên GitHub/GitLab.
2. Tạo file `vercel.json` trong thư mục gốc:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Bước 2: Thiết lập trên Vercel

1. Tạo tài khoản và đăng nhập vào [Vercel](https://vercel.com/)
2. Nhấp vào "New Project"
3. Chọn GitHub/GitLab và chọn repository của bạn
4. Thiết lập như sau:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Thiết lập các biến môi trường trong phần "Environment Variables"
6. Nhấn "Deploy"

### Bước 3: Cấu hình tên miền

1. Đến phần "Domains"
2. Thêm tên miền tùy chỉnh của bạn
3. Làm theo hướng dẫn để cấu hình DNS

## Cấu hình sau khi triển khai

### Cấu hình Google OAuth

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Đến "API & Services" > "Credentials"
3. Chỉnh sửa OAuth 2.0 Client IDs
4. Thêm Authorized redirect URIs:
   - `https://yourdomain.com/callback`
   - `https://yourdomain.com/api/auth/google-callback`
   - `https://api.yourdomain.com/api/auth/google-callback`

### Kiểm tra

1. Kiểm tra chức năng đăng nhập
2. Kiểm tra chức năng đăng bài
3. Kiểm tra các chức năng khác

## Xử lý lỗi phổ biến

### CORS

Nếu gặp lỗi CORS, đảm bảo backend đã cấu hình để chấp nhận các yêu cầu từ frontend:

```java
@Bean
public CorsFilter corsFilter() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowCredentials(true);
    config.addAllowedOrigin("https://yourdomain.com");
    config.addAllowedHeader("*");
    config.addAllowedMethod("*");

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);

    return new CorsFilter(source);
}
```

### Lỗi Authentication

Nếu đăng nhập không hoạt động, kiểm tra:

1. Biến môi trường `VITE_GOOGLE_CLIENT_ID` đã chính xác
2. URLs callback đã được thêm vào Google Cloud Console
3. CORS đã được cấu hình đúng

### Lỗi Mixed Content

Nếu trang sử dụng HTTPS nhưng gọi API qua HTTP, trình duyệt sẽ chặn. Đảm bảo tất cả URLs đều sử dụng HTTPS.
