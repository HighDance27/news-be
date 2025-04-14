import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getParentCategories, getChildCategories } from "../api";

function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("access_token");
  const role = localStorage.getItem("role");
  const [categories, setCategories] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [children, setChildren] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getParentCategories();
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryHover = async (categoryId) => {
    setActiveDropdown(categoryId);

    // Only fetch children if we don't already have them
    if (!children[categoryId]) {
      try {
        const response = await getChildCategories(categoryId);
        if (Array.isArray(response.data)) {
          setChildren((prev) => ({
            ...prev,
            [categoryId]: response.data,
          }));
        }
      } catch (err) {
        console.error(
          `Error fetching child categories for ${categoryId}:`,
          err
        );
      }
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      localStorage.removeItem("access_token");
      localStorage.removeItem("role");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="bg-white shadow-md">
      {/* Top navigation bar */}
      <nav className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">
            News App
          </Link>
          <ul className="flex space-x-6">
            <li>
              <Link to="/" className="hover:text-blue-400">
                Trang chủ
              </Link>
            </li>
            {isAuthenticated ? (
              <>
                {role === "admin" && (
                  <li>
                    <Link to="/dashboard" className="hover:text-blue-400">
                      Dashboard
                    </Link>
                  </li>
                )}
                {role === "admin" && (
                  <li>
                    <Link to="/add-article" className="hover:text-blue-400">
                      Thêm bài viết
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={handleLogout}
                    className="hover:text-blue-400 bg-transparent border-none"
                  >
                    Đăng xuất
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  to="/login"
                  state={{ from: window.location.pathname }}
                  className="hover:text-blue-400"
                >
                  Đăng nhập
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* Category navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto">
          <ul className="flex flex-wrap">
            {loading ? (
              <li className="px-4 py-3 text-gray-500">Đang tải...</li>
            ) : categories.length === 0 ? (
              <li className="px-4 py-3 text-gray-500">Không có danh mục</li>
            ) : (
              categories.map((category) => (
                <li
                  key={category.categoryId}
                  className="relative group"
                  onMouseEnter={() => handleCategoryHover(category.categoryId)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={`/category/${category.name
                      .toLowerCase()
                      .replace(/ /g, "-")}`}
                    className="block px-4 py-3 font-medium text-gray-800 border-b-2 border-transparent hover:border-blue-600 hover:text-blue-600 transition-colors duration-200"
                  >
                    {category.name}
                  </Link>

                  {/* Dropdown for subcategories */}
                  {activeDropdown === category.categoryId &&
                    children[category.categoryId] &&
                    children[category.categoryId].length > 0 && (
                      <div className="absolute left-0 mt-0 w-48 bg-white border border-gray-200 shadow-lg rounded-b-lg z-20 animate-fadeIn">
                        {children[category.categoryId].map((child) => (
                          <Link
                            key={child.categoryId}
                            to={`/category/${child.name
                              .toLowerCase()
                              .replace(/ /g, "-")}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
