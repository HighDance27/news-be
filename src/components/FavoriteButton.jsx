import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { checkFavoriteStatus, toggleFavorite, getFavorites,  deleteFavorite } from "../api";

function FavoriteButton({ articleId }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoriteId, setFavoriteId] = useState(null);

  const googleId = localStorage.getItem("google_id");

  useEffect(() => {
    if (googleId) {
      fetchFavoriteStatus();
    }
  }, [googleId, articleId]);

  const fetchFavoriteStatus = async () => {
    try {
      setLoading(true);
      const response = await checkFavoriteStatus(articleId, googleId);
      setIsFavorite(response.data);
      if (response.data) {
        const favoriteResponse = await getFavorites();
        console.log("favoriteResponse", favoriteResponse);
        const favorite = favoriteResponse.data[0];
        if (favorite && favorite.favoriteId) {
          setFavoriteId(favorite.favoriteId);
          console.log("favoriteId", favorite.favoriteId);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error("Error checking favorite status:", err);
      setError("Không thể kiểm tra trạng thái yêu thích");
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!googleId) {
      alert("Vui lòng đăng nhập để thêm vào yêu thích");
      return;
    }

    try {
      setLoading(true);
      if (isFavorite) {
        const favoriteResponse = await getFavorites();
        const favorite = favoriteResponse.data[0];
        if (favorite && favorite.favoriteId) {
          await deleteFavorite(favorite.favoriteId);
          setIsFavorite(false);
          setFavoriteId(null);
        }
      } else {
        await toggleFavorite(googleId, articleId);
        const favoriteResponse = await getFavorites();
        const favorite = favoriteResponse.data[0];
        if (favorite && favorite.favoriteId) {
          setFavoriteId(favorite.favoriteId);
          setIsFavorite(true);
        }
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setError("Không thể cập nhật trạng thái yêu thích");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <button
        disabled
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-500 bg-gray-100"
      >
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Đang tải...
      </button>
    );
  }

  if (error) {
    return (
      <button
        disabled
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-500 bg-red-50"
      >
        <svg
          className="-ml-1 mr-2 h-4 w-4 text-red-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        Lỗi
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleFavorite}
      className={`inline-flex items-center px-3 py-1.5 border ${
        isFavorite
          ? "border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
          : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
      } text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
    >
      <svg
        className={`-ml-1 mr-2 h-4 w-4 ${
          isFavorite ? "text-red-500" : "text-gray-400"
        }`}
        xmlns="http://www.w3.org/2000/svg"
        fill={isFavorite ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {isFavorite ? "Đã yêu thích" : "Yêu thích"}
    </button>
  );
}

export default FavoriteButton;