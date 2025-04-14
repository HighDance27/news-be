import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getLatestArticles, getHotArticles } from "../api";

function HomePage() {
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [hotArticles, setHotArticles] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Lấy bài viết hot
        const hotResponse = await getHotArticles();
        setHotArticles(hotResponse.data.content);

        // Lấy bài viết mới nhất
        const latestResponse = await getLatestArticles();
        setLatestArticles(latestResponse.data.content);

        // Lấy bài viết nổi bật (lấy 5 bài viết đầu tiên từ danh sách mới nhất)
        setFeaturedArticles(latestResponse.data.content.slice(0, 5));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching articles:", error);
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Section with Featured Articles */}
      <section className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Featured Article */}
            {featuredArticles[0] && (
              <div className="lg:col-span-2">
                <Link to={`/article/${featuredArticles[0].articleId}`}>
                  <div className="relative h-[500px] overflow-hidden rounded-lg group">
                    <img
                      src={
                        featuredArticles[0].thumbnailUrl ||
                        "https://via.placeholder.com/800x500"
                      }
                      alt={featuredArticles[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <span className="inline-block bg-red-600 text-white text-sm font-semibold px-3 py-1 rounded-full mb-3">
                          Tin Nổi Bật
                        </span>
                        <h2 className="text-3xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">
                          {featuredArticles[0].title}
                        </h2>
                        <p className="text-gray-200 line-clamp-2 mb-4">
                          {featuredArticles[0].summary}
                        </p>
                        <div className="flex items-center text-gray-300 text-sm">
                          <span>
                            {formatDate(featuredArticles[0].createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Secondary Featured Articles */}
            <div className="space-y-6">
              {featuredArticles.slice(1, 4).map((article) => (
                <Link
                  key={article.articleId}
                  to={`/article/${article.articleId}`}
                  className="block group"
                >
                  <div className="relative h-40 overflow-hidden rounded-lg">
                    <img
                      src={
                        article.thumbnailUrl ||
                        "https://via.placeholder.com/400x300"
                      }
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">
                          {article.title}
                        </h3>
                        <span className="text-gray-300 text-sm">
                          {formatDate(article.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hot News Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 border-b-4 border-red-600 pb-2">
              Tin Hot
            </h2>
            <Link
              to="/hot-news"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hotArticles.map((article) => (
              <Link
                key={article.articleId}
                to={`/article/${article.articleId}`}
                className="group h-full"
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={
                        article.thumbnailUrl ||
                        "https://via.placeholder.com/400x300"
                      }
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Hot
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-gray-600 text-sm line-clamp-2 flex-grow">
                      {article.summary}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {formatDate(article.createdAt)}
                      </span>
                      <span className="text-blue-600 text-sm font-medium">
                        Đọc tiếp
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 border-b-4 border-blue-600 pb-2">
              Tin Mới Nhất
            </h2>
            <Link
              to="/latest-news"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestArticles.map((article) => (
              <Link
                key={article.articleId}
                to={`/article/${article.articleId}`}
                className="group h-full"
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={
                        article.thumbnailUrl ||
                        "https://via.placeholder.com/400x300"
                      }
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Mới
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-gray-600 text-sm line-clamp-2 flex-grow">
                      {article.summary}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {formatDate(article.createdAt)}
                      </span>
                      <span className="text-blue-600 text-sm font-medium">
                        Đọc tiếp
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
