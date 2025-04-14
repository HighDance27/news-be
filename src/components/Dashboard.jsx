import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getArticles } from "../api";

function Dashboard() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        console.log("Fetching articles...");
        const response = await getArticles();
        console.log("Articles API response:", response.data);

        // Check if the response has a content field (pagination format)
        if (response.data && response.data.content) {
          setArticles(response.data.content);
        } else if (Array.isArray(response.data)) {
          setArticles(response.data);
        } else {
          console.error("Unexpected API response format:", response.data);
          setArticles([]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError("Không thể tải danh sách bài viết");
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;
  if (articles.length === 0)
    return <div className="text-center py-8">Chưa có bài viết nào</div>;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý bài viết</h1>
        <Link
          to="/add-article"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm bài viết mới
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div
            key={article.articleId}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col"
          >
            <div className="relative aspect-w-16 aspect-h-9">
              <img
                src={article.thumbnailUrl || "https://via.placeholder.com/400x225"}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  {article.status || "Đang chờ"}
                </span>
              </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                <Link
                  to={`/article/${article.articleId}`}
                  className="text-gray-900 hover:text-blue-600 transition-colors duration-200"
                >
                  {article.title}
                </Link>
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                {article.summary}
              </p>
              <div className="mt-auto flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {formatDate(article.createdAt)}
                </span>
                <div className="flex space-x-2">
                  <Link
                    to={`/edit-article/${article.articleId}`}
                    className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Chỉnh sửa
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
