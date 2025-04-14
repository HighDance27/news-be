import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getHomeArticles } from "../api";
import ArticleImage from "./ArticleImage";

function TagPage() {
  const { tagId } = useParams();
  const [articles, setArticles] = useState([]);
  const [tagName, setTagName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Decode the tagId from URL
  const decodedTagId = decodeURIComponent(tagId);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsTransitioning(true);
        const response = await getHomeArticles(page, 9);
        // Filter articles that have the matching tag name
        const filteredArticles = response.data.content.filter(article => 
          article.tags?.some(tag => tag.name.toLowerCase() === decodedTagId.toLowerCase())
        );
        
        setArticles(filteredArticles);
        setTagName(decodedTagId);
        setTotalPages(Math.ceil(filteredArticles.length / 9));
        setLoading(false);
        // Add a small delay before removing transition effect
        setTimeout(() => setIsTransitioning(false), 0);
      } catch (error) {
        console.error("Error fetching articles by tag:", error);
        setError("Không thể tải bài viết");
        setLoading(false);
        setIsTransitioning(false);
      }
    };

    fetchArticles();
  }, [decodedTagId, page]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-1">
            <li>
              <Link to="/" className="hover:text-blue-600">
                Trang chủ
              </Link>
            </li>
            <li>
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </li>
            <li>
              <span className="text-gray-700">Tag: {tagName}</span>
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Bài viết với tag: <span className="text-3xl text-red-900 mb-6">{tagName}</span>
        </h1>
        {articles.length === 0 ? (
          <p className="text-gray-600">Không có bài viết nào cho tag này.</p>
        ) : (
          <>
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
              {articles.map((article) => (
                <div
                  key={article.articleId}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  {article.thumbnailUrl && (
                    <Link to={`/article/${article.articleId}`}>
                      <div className="relative h-48 w-full rounded-t-lg overflow-hidden group">
                        <ArticleImage
                          imageUrl={article.thumbnailUrl}
                          thumbnailUrl={article.thumbnailUrl}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </Link>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2 text-gray-900 line-clamp-2">
                      <Link
                        to={`/article/${article.articleId}`}
                        className="hover:text-blue-700 transition-colors duration-200"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-3">
                      {article.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400 text-xs">
                        {new Date(article.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                      <Link
                        to={`/article/${article.articleId}`}
                        className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors duration-200"
                      >
                        Đọc thêm →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination Controls */}
            <div className="mt-12 flex justify-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                disabled={page === 0}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Trang trước
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors duration-200 ${
                      page === i
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
              >
                Trang sau
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TagPage;