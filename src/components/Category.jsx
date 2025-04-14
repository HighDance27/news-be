import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getArticlesByCategory } from "../api";
import ArticleImage from "./ArticleImage";

function Category() {
  const { category } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryTitle, setCategoryTitle] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);

    const formattedCategory = category.replace(/-/g, " ");
    setCategoryTitle(formattedCategory);

    const fetchArticles = async () => {
      try {
        const response = await getArticlesByCategory(category);
        console.log("Category articles response:", response.data);
        if (Array.isArray(response.data)) {
          setArticles(response.data);
        } else {
          console.error("Unexpected API response format:", response.data);
          setArticles([]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching category articles:", err);
        setError("Không thể tải bài viết cho danh mục này");
        setLoading(false);
      }
    };

    fetchArticles();
  }, [category]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="text-red-500 text-center">
            <h2 className="text-lg font-medium">Đã xảy ra lỗi</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );

  const displayTitle =
    categoryTitle.charAt(0).toUpperCase() + categoryTitle.slice(1);

  // Split articles for different layouts if we have enough
  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const remainingArticles = articles.length > 1 ? articles.slice(1) : [];

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="border-b border-gray-200 mb-8">
          <div className="flex justify-between items-center pb-3">
            <h1 className="text-3xl font-bold text-gray-900 capitalize">
              {displayTitle}
            </h1>
            <div className="text-sm text-gray-500">
              {articles.length}{" "}
              {articles.length === 1 ? "bài viết" : "bài viết"}
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        <nav
          className="flex mb-6 text-sm text-gray-500"
          aria-label="Breadcrumb"
        >
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
              <span className="text-gray-700 capitalize">{displayTitle}</span>
            </li>
          </ol>
        </nav>

        {featuredArticle && (
          <div className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="overflow-hidden rounded-lg">
                <Link to={`/article/${featuredArticle.articleId}`}>
                  <div className="relative h-80 w-full">
                    <ArticleImage
                      imageUrl={featuredArticle.imageUrl}
                      thumbnailUrl={featuredArticle.thumbnailUrl}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </Link>
              </div>
              <div className="flex flex-col justify-center">
                <div className="mb-2">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-md mr-2 capitalize">
                    {displayTitle}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {formatDate(featuredArticle.createdAt)}
                  </span>
                </div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900 hover:text-blue-700">
                  <Link to={`/article/${featuredArticle.articleId}`}>
                    {featuredArticle.title}
                  </Link>
                </h2>
                <p className="text-gray-600 text-lg mb-4 line-clamp-3">
                  {featuredArticle.summary}
                </p>
                <Link
                  to={`/article/${featuredArticle.articleId}`}
                  className="text-blue-600 font-medium hover:text-blue-800 flex items-center"
                >
                  Đọc tiếp
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}

        {remainingArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {remainingArticles.map((article) => (
              <div
                key={article.articleId}
                className="flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition-shadow duration-300"
              >
                <Link
                  to={`/article/${article.articleId}`}
                  className="block overflow-hidden"
                >
                  <div className="relative h-48 w-full">
                    <ArticleImage
                      imageUrl={article.imageUrl}
                      thumbnailUrl={article.thumbnailUrl}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="p-4 flex flex-col flex-grow">
                  <div className="mb-2 flex justify-between items-center">
                    <span className="text-gray-500 text-xs">
                      {formatDate(article.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 hover:text-blue-700 line-clamp-2">
                    <Link to={`/article/${article.articleId}`}>
                      {article.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
                    {article.summary}
                  </p>
                  <Link
                    to={`/article/${article.articleId}`}
                    className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center mt-auto"
                  >
                    Đọc tiếp
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !featuredArticle && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không có bài viết
              </h3>
              <p className="text-gray-500">
                Chưa có bài viết nào trong danh mục này.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Category;
