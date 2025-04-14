import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getArticlesByAuthor, getPendingArticles } from "../api";

function EditorDashboard() {
  const [articles, setArticles] = useState([]);
  const [pendingArticles, setPendingArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingError, setPendingError] = useState(null);
  const [userName, setUserName] = useState("");
  const [userPicture, setUserPicture] = useState("");
  const [page, setPage] = useState(0);
  const [pendingPage, setPendingPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [pendingTotalPages, setPendingTotalPages] = useState(0);
  //   const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    const picture = localStorage.getItem("user_picture");
    const googleId = localStorage.getItem("google_id");
    setUserName(name || "");
    setUserPicture(picture || "");

    const fetchArticles = async () => {
      try {
        // Check if we have the Google ID
        if (!googleId) {
          console.error("Google ID not found in localStorage");
          setError(
            "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
          );
          setLoading(false);
          return;
        }

        console.log(`Fetching articles for author ID (Google ID): ${googleId}`);
        const response = await getArticlesByAuthor(
          googleId,
          page,
          size,
          "title"
        );

        console.log("API Response:", response.data);

        // Handle paginated response
        if (response.data && response.data.content) {
          setArticles(response.data.content);
          console.log("Articles:", response.data.content);
          setTotalPages(response.data.totalPages);
        } else if (Array.isArray(response.data)) {
          setArticles(response.data);
        } else {
          console.error("Unexpected API response format:", response.data);
          setArticles([]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching author articles:", err);
        setError("Không thể tải danh sách bài viết");
        setLoading(false);
      }
    };

    const fetchPendingArticles = async () => {
      try {
        // Check if we have the Google ID
        if (!googleId) {
          console.error("Google ID not found in localStorage");
          setPendingError(
            "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
          );
          setPendingLoading(false);
          return;
        }

        console.log(`Fetching pending articles for author ID (Google ID): ${googleId}`);
        const response = await getPendingArticles(pendingPage, size, "title");
        
        if (response.data && response.data.content) {
          // Filter articles by author's googleId
          const authorArticles = response.data.content.filter(
            article => article.author.googleId === googleId
          );
          setPendingArticles(authorArticles);
          setPendingTotalPages(response.data.totalPages);
        } else {
          console.error("Unexpected pending articles API response format:", response.data);
          setPendingArticles([]);
        }
        
        setPendingLoading(false);
      } catch (err) {
        console.error("Error fetching pending articles:", err);
        setPendingError("Không thể tải danh sách bài viết đang chờ");
        setPendingLoading(false);
      }
    };

    fetchArticles();
    fetchPendingArticles();
  }, [page, pendingPage, size]);

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handlePendingNextPage = () => {
    if (pendingPage < pendingTotalPages - 1) {
      setPendingPage(pendingPage + 1);
    }
  };

  const handlePendingPrevPage = () => {
    if (pendingPage > 0) {
      setPendingPage(pendingPage - 1);
    }
  };

  if (loading || pendingLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Trang Biên Tập Viên
          </h1>
          <div className="flex items-center">
            {userPicture && (
              <img
                src={userPicture}
                alt={userName}
                className="w-10 h-10 rounded-full mr-3 border-2 border-blue-500"
              />
            )}
            <span className="text-gray-700 font-medium">{userName}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-red-800">
            Quản lý bài viết của tôi
          </h2>
          <Link
            to="/add-article"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Viết bài mới
          </Link>
        </div>

        {/* Pending Articles Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Bài viết đang chờ duyệt
          </h3>
          {pendingError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {pendingError}
            </div>
          )}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {pendingArticles.length > 0 ? (
              <>
                <ul className="divide-y divide-gray-200">
                  {pendingArticles.map((article) => (
                    <li
                      key={article.articleId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                          <div className="relative w-24 h-16 flex-shrink-0">
                            <img
                              src={article.thumbnailUrl || "https://via.placeholder.com/96x64"}
                              alt={article.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                            <div>
                              <p className="text-sm font-medium text-blue-600 truncate">
                                {article.title}
                              </p>
                              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                {article.summary || "Không có tóm tắt"}
                              </p>
                            </div>
                          </div>
                          
                          <div className="ml-2 flex-shrink-0 flex flex-col items-end space-y-2">
                            <div className="flex space-x-4">
                              <Link
                                to={`/edit-article/${article.articleId}`}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Chỉnh sửa
                              </Link>
                            
                            </div>
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Đang chờ duyệt
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Tạo ngày: {new Date(article.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Pending Articles Pagination */}
                {pendingTotalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between">
                      <button
                        onClick={handlePendingPrevPage}
                        disabled={pendingPage === 0}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                          pendingPage === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Trang trước
                      </button>
                      <div className="text-sm text-gray-500">
                        Trang {pendingPage + 1} / {pendingTotalPages}
                      </div>
                      <button
                        onClick={handlePendingNextPage}
                        disabled={pendingPage >= pendingTotalPages - 1}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                          pendingPage >= pendingTotalPages - 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Trang sau
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Không có bài viết nào đang chờ duyệt
              </div>
            )}
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Bài viết đã xuất bản
          </h3>
        {/* My Articles Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {articles.length > 0 ? (
            <>
              <ul className="divide-y divide-gray-200">
                {articles.map((article) => (
                  <li
                    key={article.articleId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative w-24 h-16 flex-shrink-0">
                            <img
                              src={article.thumbnailUrl || "https://via.placeholder.com/96x64"}
                              alt={article.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-600 truncate">
                              {article.title}
                            </p>
                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                              {article.summary || "Không có tóm tắt"}
                            </p>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex flex-col items-end space-y-2">
                          <div className="flex space-x-4">
                            <Link
                              to={`/edit-article/${article.articleId}`}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Chỉnh sửa
                            </Link>
                            <Link
                              to={`/article/${article.articleId}`}
                              className="text-gray-600 hover:text-gray-900 flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Xem
                            </Link>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              article.status === "PUBLISHED"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {article.status === "PUBLISHED"
                              ? "Đã xuất bản"
                              : "Chưa xuất bản"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Tạo ngày: {new Date(article.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between">
                    <button
                      onClick={handlePrevPage}
                      disabled={page === 0}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        page === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Trang trước
                    </button>
                    <div className="text-sm text-gray-500">
                      Trang {page + 1} / {totalPages}
                    </div>
                    <button
                      onClick={handleNextPage}
                      disabled={page >= totalPages - 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        page >= totalPages - 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Trang sau
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Bạn chưa có bài viết nào. Hãy bắt đầu viết bài mới!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default EditorDashboard;
