import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getFavorites } from "../api";
import ArticleImage from "./ArticleImage";

function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const googleId = localStorage.getItem("google_id");

  useEffect(() => {
    if (googleId) {
      fetchFavorites();
    }
  }, [googleId]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await getFavorites();
      console.log("getFavorites response:", response.data); // Debug dữ liệu
      setFavorites(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setError("Không thể tải danh sách yêu thích");
      setLoading(false);
    }
  };
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

  if (!googleId) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Vui lòng đăng nhập
            </h2>
            <p className="text-gray-600 mb-8">
              Bạn cần đăng nhập để xem danh sách yêu thích của mình.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Bài viết yêu thích
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Danh sách các bài viết bạn đã yêu thích
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : favorites.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Bạn chưa yêu thích bài viết nào
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {favorites.map((favorite) => (
                <Link
                  key={favorite.favoriteId}
                  to={`/article/${favorite.article.articleId}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-24 h-24">
                        {favorite.article.thumbnailUrl ? (
                          <ArticleImage
                            imageUrl={favorite.article.thumbnailUrl}
                            thumbnailUrl={favorite.article.thumbnailUrl}
                            alt={favorite.article.title}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-400 text-xs">
                              No image
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900">
                          {favorite.article.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {favorite.article.summary}
                        </p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span className="flex items-center">
                            <svg
                              className="h-4 w-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {formatDate(favorite.favoritedAt)}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="text-blue-600 hover:text-blue-800">
                            {favorite.article.author.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FavoritesPage;
