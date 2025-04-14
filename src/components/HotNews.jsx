import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getHotArticles } from "../api";

function HotNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotArticles = async () => {
      try {
        const response = await getHotArticles(0, 9, "desc");
        setArticles(response.data.content);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải tin nóng");
        setLoading(false);
      }
    };

    fetchHotArticles();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
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

  // Separate featured article and remaining articles
  const [featuredArticle, ...remainingArticles] = articles;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
        <svg className="w-8 h-8 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
        Tin Nóng
      </h2>
      <h3 className="text-2xl font-bold text-gray-500 mb-6 flex items-center">
        Tổng hợp các tin nóng nhất trong tuần
        </h3>
      {featuredArticle && (
        <Link
          to={`/article/${featuredArticle.articleId}`}
          className="block group mb-8"
        >
          <div className="grid md:grid-cols-2 gap-6 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 md:aspect-h-full">
              <img
                src={featuredArticle.thumbnailUrl || "https://via.placeholder.com/800x450"}
                alt={featuredArticle.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-6 flex flex-col h-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-red-600 transition-colors duration-200">
                {featuredArticle.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {featuredArticle.summary}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                <span className="inline-block bg-blue-100 border border-gray-200 rounded px-2 py-1 text-blue-600 text-sm">{formatDate(featuredArticle.createdAt)}</span>
              </div>
            </div>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {remainingArticles.map((article) => (
          <Link
            key={article.articleId}
            to={`/article/${article.articleId}`}
            className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col"
          >
            <div className="relative aspect-w-16 aspect-h-9">
              <img
                src={article.thumbnailUrl || "https://via.placeholder.com/400x225"}
                alt={article.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2">
                <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  Hot
                </span>
              </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-200 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                {article.summary}
              </p>
              
              <div className="mt-auto flex items-center justify-between text-sm text-gray-500">
                <span className="inline-block bg-blue-100 border border-gray-200 rounded px-2 py-1 text-blue-600 text-sm">{formatDate(article.createdAt)}</span>
              </div>
              
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default HotNews; 