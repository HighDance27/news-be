import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getLatestArticles } from "../api";

function LatestNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestArticles = async () => {
      try {
        const response = await getLatestArticles(0, 10, "createdAt,desc");
        setArticles(response.data.content);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải tin mới");
        setLoading(false);
      }
    };

    fetchLatestArticles();
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
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Tin Mới Nhất</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Link
          key={article.articleId}
          to={`/article/${article.articleId}`}
            className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={article.thumbnailUrl || "https://via.placeholder.com/400x225"}
                alt={article.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                {article.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {article.description}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>{article.summary}</span>
              </div>
              <div className="inline-block bg-blue-100 border border-gray-200 rounded px-2 py-1 text-blue-600 text-sm">
                {formatDate(article.createdAt)}
              </div>
              
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default LatestNews; 