import React, { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getArticlesByCategory, getCategoriesTree, searchArticlesByCategory } from "../api";

function CategoryPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [categoryName, setCategoryName] = useState("");
  const [parentCategory, setParentCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    window.scrollTo(0, 0);
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch category tree to get subcategories
        const categoriesResponse = await getCategoriesTree();
        const { category, parent } = findCategoryAndParentById(categoriesResponse, parseInt(categoryId));
        
        if (category) {
          setCategoryName(category.name);
          setParentCategory(parent);
          setSubcategories(category.subcategories || []);
          
          // Get all category IDs including subcategories
          const allCategoryIds = [category.categoryId];
          if (category.subcategories) {
            category.subcategories.forEach(sub => {
              allCategoryIds.push(sub.categoryId);
            });
          }

          let articlesData;
          if (query) {
            // Search articles in category and its subcategories
            const searchPromises = allCategoryIds.map(catId => 
              searchArticlesByCategory(query, catId)
            );
            
            const searchResponses = await Promise.all(searchPromises);
            const allSearchResults = searchResponses.flatMap(response => response.data.content);
            
            // Remove duplicates based on articleId
            articlesData = Array.from(new Set(allSearchResults.map(a => a.articleId)))
              .map(id => allSearchResults.find(a => a.articleId === id));
          } else {
            // Fetch articles for all categories
            const articlesPromises = allCategoryIds.map(catId => 
              getArticlesByCategory(catId, currentPage, 10, "title")
            );
            
            const articlesResponses = await Promise.all(articlesPromises);
            const allArticles = articlesResponses.flatMap(response => response.content);
            
            // Remove duplicates based on articleId
            articlesData = Array.from(new Set(allArticles.map(a => a.articleId)))
              .map(id => allArticles.find(a => a.articleId === id));
          }
            
          setArticles(articlesData);
          setTotalPages(Math.ceil(articlesData.length / 10));
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Không thể tải dữ liệu");
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId, currentPage, searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.append("q", searchQuery.trim());
      window.location.href = `/category/${categoryId}?${params.toString()}`;
    }
  };

  // Helper function to find category and its parent by ID in the tree
  const findCategoryAndParentById = (categories, id, parent = null) => {
    for (const category of categories) {
      if (category.categoryId === id) {
        return { category, parent };
      }
      if (category.subcategories) {
        const result = findCategoryAndParentById(category.subcategories, id, category);
        if (result) return result;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
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
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Search Form */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Tìm kiếm trong danh mục ${categoryName}...`}
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* Breadcrumbs */}
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
            {parentCategory && (
              <>
                <li>
                  <Link to={`/category/${parentCategory.categoryId}`} className="hover:text-blue-600">
                    {parentCategory.name}
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
              </>
            )}
            <li>
              <span className="text-gray-700">{categoryName}</span>
            </li>
          </ol>
        </nav>

        <div className="border-b border-gray-200 mb-10">
          <div className="pb-5">
            {subcategories.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Khám phá các danh mục con</h3>
                <div className="flex flex-wrap gap-2">
                  {subcategories.map((sub) => (
                    <Link
                      key={sub.categoryId}
                      to={`/category/${sub.categoryId}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors duration-200"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link
                key={article.articleId}
                to={`/article/${article.articleId}`}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="aspect-w-16 aspect-h-9 mb-4 group">
                    <img
                      src={
                        article.thumbnailUrl ||
                        "https://via.placeholder.com/400x225"
                      }
                      alt={article.title}
                      className="object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {article.summary}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="group-hover:text-gray-700 transition-colors duration-200">
                      {new Date(article.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    <div className="flex items-center space-x-2">                   
                      <span className="text-red-500 group-hover:text-red-600 transition-colors duration-200">{article.authorName}</span>
                    </div> 
                  </div>
                  <span className="text-blue-600 font-medium group-hover:text-blue-700 transition-colors duration-200">
                    {article.category.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
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
              Không có bài viết nào
            </h3>
            <p className="text-gray-500">
              Hiện chưa có bài viết nào trong danh mục này.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
                className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="text-gray-700">
                Trang {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
                }
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryPage;
