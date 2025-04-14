import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getReadingHistory } from "../api";
import ArticleImage from "./ArticleImage";

function ReadingHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const userId = localStorage.getItem("google_id");

  useEffect(() => {
    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await getReadingHistory(userId);
      setHistory(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching reading history:", err);
      setError("Không thể tải lịch sử đọc");
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

  if (!userId) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-white hover:text-blue-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Lịch sử đọc</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Lịch sử đọc gần đây
              </h3>
              <Link
                to="/reading-history"
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => setIsOpen(false)}
              >
                Xem tất cả
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : history.length === 0 ? (
              <div className="text-gray-500 text-center py-4">
                Chưa có lịch sử đọc
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {history.slice(0, 5).map((item) => (
                  <Link
                    key={item.articleId}
                    to={`/article/${item.articleId}`}
                    className="block hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0 w-16 h-16">
                        {item.thumbnailUrl ? (
                          <ArticleImage
                            imageUrl={item.thumbnailUrl}
                            thumbnailUrl={item.thumbnailUrl}
                            alt={item.title}
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
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {item.summary}
                        </p>
                        <div className="mt-1 flex items-center text-xs text-gray-500">
                          <span>{formatDate(item.lastViewedAt)}</span>
                          <span className="mx-1">•</span>
                          <span>{item.viewCount} lượt xem</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReadingHistory;
