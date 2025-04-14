import { useLocation } from "react-router-dom";
import { URLs } from "../api";

function Login() {
  const location = useLocation();
  const error = location.state?.error;
  const from = location.state?.from || "/";

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri =
      import.meta.env.VITE_GOOGLE_CALLBACK_URL ||
      `${URLs.BACKEND_URL}/api/auth/google-callback`;
    const callbackUrl = import.meta.env.VITE_CALLBACK_URL || URLs.CALLBACK_URL;

    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=openid%20email%20profile&state=${encodeURIComponent(
      callbackUrl
    )}`;

    sessionStorage.setItem("redirect_after_login", from);
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center p-4 pt-10">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md mt-4">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
          <h2 className="text-3xl font-bold text-white">Chào Mừng</h2>
          <p className="text-blue-100 mt-2">Đăng nhập để sử dụng đầy đủ các chức năng nhé!</p>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="font-medium">Continue with Google</span>
          </button>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
            Tiếp tục là đồng ý với điều khoản sử dụng và chính sách bảo mật của chúng tôi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
