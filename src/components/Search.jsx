import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { searchArticles, searchArticlesByCategory } from "../api";

function Search() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryId = searchParams.get("categoryId");

  useEffect(() => {
    const searchQuery = searchParams.get("q");
    if (searchQuery) {
      setQuery(searchQuery);
      performSearch(searchQuery);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      let response;
      if (categoryId) {
        response = await searchArticlesByCategory(searchQuery, categoryId);
      } else {
        response = await searchArticles(searchQuery);
      }
      setSearchResults(response.data.content);
    } catch (error) {
      console.error("Error searching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      const params = new URLSearchParams();
      params.append("q", query.trim());
      if (categoryId) {
        params.append("categoryId", categoryId);
      }
      navigate(`/search?${params.toString()}`);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Tìm kiếm bài viết</h1>
        <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập từ khóa tìm kiếm..."
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Search Results */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">
              Kết quả tìm kiếm cho "{searchParams.get("q")}"
              {categoryId && " trong danh mục"}
            </h2>
            {searchResults.map((article) => (
              <Link
                key={article.articleId}
                to={`/article/${article.articleId}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start p-4">
                  {article.thumbnailUrl && (
                    <div className="flex-shrink-0 w-48 h-32 mr-4">
                      <img
                        src={article.thumbnailUrl}
                        alt={article.title}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {article.summary}
                      </p>
                    )}
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                    <div className="inline-block bg-blue-100 border border-gray-200 rounded px-2 py-1 text-blue-600 text-sm">

                        {article.category.name}
                      </div>
                      {formatDate(article.createdAt)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : searchParams.get("q") ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              Không tìm thấy kết quả nào cho "{searchParams.get("q")}"
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Search;
