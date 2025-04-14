import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCategoriesTree } from "../api";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await getCategoriesTree();

        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          console.error("Unexpected API response format:", response.data);
          setCategories([]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Không thể tải danh sách danh mục");
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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
              <span className="text-gray-700">Danh mục</span>
            </li>
          </ol>
        </nav>

        <div className="border-b border-gray-200 mb-10">
          <div className="pb-5">
            <h1 className="text-3xl font-bold text-gray-900">
              Tất cả danh mục
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Khám phá tất cả các danh mục bài viết của chúng tôi
            </p>
          </div>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <div
                key={category.categoryId}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-4">
                      <svg
                        className="h-6 w-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0L10 9.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      <Link
                        to={`/category/${category.categoryId}`}
                        className="hover:text-blue-600"
                      >
                        {category.name}
                      </Link>
                    </h3>
                  </div>

                  <p className="text-gray-600 mb-6 line-clamp-2">
                    {category.description ||
                      `Các bài viết về ${category.name.toLowerCase()}`}
                  </p>

                  {/* Subcategories */}
                  {category.subcategories &&
                    category.subcategories.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Danh mục con:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {category.subcategories.map((subcat) => (
                            <Link
                              key={subcat.categoryId}
                              to={`/category/${subcat.categoryId}`}
                              className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                            >
                              {subcat.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link
                      to={`/category/${category.categoryId}`}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                    >
                      Xem tất cả bài viết
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
              Không có danh mục nào
            </h3>
            <p className="text-gray-500">Hiện chưa có danh mục nào được tạo.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Categories;
