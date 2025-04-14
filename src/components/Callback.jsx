import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Callback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("Callback component loaded, search params:", location.search);
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("access_token");
    const role = params.get("role");
    const error = params.get("error");
    const name = params.get("name");
    const email = params.get("email");
    const picture = params.get("picture");
    const googleId = params.get("googleId");

    // Lấy trang chuyển hướng từ sessionStorage
    const redirectTo = sessionStorage.getItem("redirect_after_login") || "/";
    sessionStorage.removeItem("redirect_after_login"); // Xóa sau khi đã sử dụng

    console.log("Parsed params:", {
      accessToken,
      role,
      error,
      name,
      email,
      picture,
      googleId,
    });
    console.log("Redirect to:", redirectTo);

    if (error) {
      console.error("Login error:", error);
      navigate("/login", {
        state: { error: "Login failed: " + error },
        replace: true,
      });
      return;
    }

    if (accessToken && role) {
      console.log("Login successful, saving user data");
      // Lưu token vào localStorage để sử dụng cho các API call sau này
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("role", role);

      // Lưu thêm thông tin người dùng
      if (name) localStorage.setItem("user_name", name);
      if (email) localStorage.setItem("user_email", email);
      if (picture) localStorage.setItem("user_picture", picture);
      if (googleId) localStorage.setItem("google_id", googleId);

      // Sau khi đăng nhập thành công, chuyển hướng người dùng theo vai trò
      if (role === "admin") {
        // Admin luôn chuyển hướng đến trang admin
        navigate("/admin-dashboard", { replace: true });
      } else if (role === "editor") {
        // Biên tập viên chuyển hướng đến trang biên tập
        navigate("/editor-dashboard", { replace: true });
      } else {
        // Người dùng thông thường chuyển hướng đến trang trước đó hoặc trang chủ
        navigate(redirectTo, { replace: true });
      }
    } else {
      console.error("Invalid login response, missing token or role");
      navigate("/login", {
        state: { error: "Invalid login response" },
        replace: true,
      });
    }
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-lg">Đang đăng nhập...</p>
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mt-4"></div>
      </div>
    </div>
  );
}

export default Callback;
