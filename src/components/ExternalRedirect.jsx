import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Component này xử lý redirect từ domain khác (stunews.static.domains)
 * Nó sẽ lấy toàn bộ query parameters và chuyển hướng đến /callback
 */
function ExternalRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy URL hiện tại và các query parameters
    const currentUrl = window.location.href;
    console.log("External redirect detected, processing URL:", currentUrl);

    // Trích xuất query parameters
    const urlObj = new URL(currentUrl);
    const searchParams = urlObj.searchParams;

    // Tạo đối tượng chứa tất cả parameters
    const paramsObj = {};
    searchParams.forEach((value, key) => {
      paramsObj[key] = value;
    });

    console.log("Extracted parameters:", paramsObj);

    // Chuyển hướng đến /callback với các parameters
    navigate("/callback" + urlObj.search, { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-lg">Đang xử lý đăng nhập...</p>
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mt-4"></div>
      </div>
    </div>
  );
}

export default ExternalRedirect;
