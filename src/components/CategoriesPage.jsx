import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCategoriesTree } from "../api";

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategoriesTree();
        setCategories(response);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const CategoryCard = ({ category, isChild = false, isLast = false }) => (
    <div className="relative">
      {isChild && (
        <>
          <div className="absolute -left-8 top-0 h-1/2 border-l-2 border-gray-300"></div>
          <div className="absolute -left-8 top-1/2 h-8 border-l-2 border-gray-300"></div>
          <div className="absolute -left-8 top-8 w-8 border-t-2 border-gray-300"></div>
          {!isLast && <div className="absolute -left-8 top-1/2 h-full border-l-2 border-gray-300"></div>}
        </>
      )}
      <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 ${isChild ? 'ml-8' : ''}`}>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className={`h-12 w-12 flex items-center justify-center rounded-full ${isChild ? 'bg-blue-50 text-blue-500' : 'bg-blue-100 text-blue-600'} mr-4`}>
              <svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {isChild ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                  />
                )}
              </svg>
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isChild ? 'text-gray-800' : 'text-gray-900'}`}>
                <Link to={`/category/${category.categoryId}`} className="hover:text-blue-600">
                  {category.name}
                </Link>
              </h3>
              {category.parentId && (
                <span className="text-sm text-gray-500">
                  Danh mục con
                </span>
              )}
            </div>
          </div>

          <p className="text-gray-600 mb-6 line-clamp-2">
            {category.description || `Các bài viết về ${category.name.toLowerCase()}`}
          </p>

          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
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
            {category.subcategories?.length > 0 && (
              <span className="text-sm text-gray-500">
                {category.subcategories.length} danh mục con
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Danh Mục</h1>
          <p className="mt-2 text-sm text-gray-600">
            Khám phá các danh mục bài viết của chúng tôi
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="space-y-12">
            {categories.map((parentCategory) => (
              <div key={parentCategory.categoryId} className="relative">
                <CategoryCard category={parentCategory} />
                {parentCategory.subcategories && parentCategory.subcategories.length > 0 && (
                  <div className="mt-6 pl-12 space-y-6">
                    {parentCategory.subcategories.map((childCategory, index) => (
                      <CategoryCard
                        key={childCategory.categoryId}
                        category={childCategory}
                        isChild={true}
                        isLast={index === parentCategory.subcategories.length - 1}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
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

export default CategoriesPage;
