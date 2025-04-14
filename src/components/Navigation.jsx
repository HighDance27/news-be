import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getParentCategories, getChildCategories, requestEditorRole, searchArticles } from "../api";
import { useAuth } from "../contexts/AuthContext";

function Navigation() {
  const [categories, setCategories] = useState([]);
  const [childCategories, setChildCategories] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [requestSuccessMessage, setRequestSuccessMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getParentCategories();
        if (Array.isArray(response)) {
          setCategories(response);
          // Fetch child categories for each parent category
          response.forEach(async (category) => {
            const children = await getChildCategories(category.categoryId);
            setChildCategories(prev => ({
              ...prev,
              [category.categoryId]: children
            }));
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleRequestEditorRole = async () => {
    if (!user || user.role !== "user") {
      return;
    }

    try {
      await requestEditorRole();
      setRequestSuccessMessage("Đã gửi yêu cầu làm biên tập viên thành công!");
      setTimeout(() => {
        setRequestSuccessMessage(null);
      }, 5000);
    } catch (error) {
      console.error("Error requesting editor role:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchResults(false);
    }
    setSearchQuery("");
  };

  const handleSearchInputChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim().length >= 2) {
      setIsSearching(true);
      try {
        const response = await searchArticles(value.trim(), 0, 5);
        setSearchResults(response.data.content);
        setShowSearchResults(true);
      } catch (error) {
        console.error("Error searching articles:", error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleClickOutside = () => {
    setTimeout(() => {
      setShowSearchResults(false);
    }, 200);
  };

  return (
    <header className="bg-gray-200 shadow-md relative">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo and Quick Links */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">News</span>
            </Link>

            <Link
              to="/latest-news"
              className="hidden md:flex items-center text-gray-700 hover:text-blue-600 font-medium"
            >
              <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Tin Mới
            </Link>
            
            <Link
              to="/hot-news"
              className="hidden md:flex items-center text-gray-700 hover:text-blue-600 font-medium"
            >
              <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
              </svg>
              Tin Nóng
            </Link>
          </div>

          {/* Search */}
          <div className={`hidden md:flex items-center flex-1 max-w-xl mx-6 relative ${isSearchFocused ? 'ring-2 ring-blue-300' : ''}`}>
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Tìm kiếm tin tức..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    if (searchResults.length > 0) setShowSearchResults(true);
                  }}
                  onBlur={() => {
                    setIsSearchFocused(false);
                    handleClickOutside();
                  }}
                />
                <button type="submit" className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      {searchResults.map((article) => (
                        <Link
                          key={article.articleId}
                          to={`/article/${article.articleId}`}
                          className="flex items-center px-4 py-2 hover:bg-gray-50"
                          onClick={() => setShowSearchResults(false)}
                        >
                          <img
                            src={article.thumbnailUrl || "https://via.placeholder.com/60x40"}
                            alt={article.title}
                            className="w-15 h-10 object-cover rounded mr-3"
                          />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{article.title}</h4>
                            {article.summary && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{article.summary}</p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Loading Indicator */}
                {isSearching && (
                  <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  <img
                    src={user.picture || "https://via.placeholder.com/40"}
                    alt={user.name}
                    className="w-8 h-8 rounded-full ring-2 ring-gray-200 group-hover:ring-blue-500 transition-all duration-200"
                  />
                  <span className="hidden md:inline font-medium">
                    {user.name}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div className="absolute right-0 mt-[0.5] z-50 w-56 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block border border-gray-100">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    to="/reading-history"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Lịch sử đọc
                  </Link>
                  <Link
                    to="/favorites"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    Tin yêu thích
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      to="/admin-dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Quản trị
                    </Link>
                  )}
                  {user.role === "editor" && (
                    <Link
                      to="/editor-dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Biên tập
                    </Link>
                  )}
                  {user.role === "user" && (
                    <button
                      onClick={handleRequestEditorRole}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                      Yêu cầu làm biên tập viên
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Tìm kiếm tin tức..."
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchResults(true);
              }}
              onBlur={handleClickOutside}
            />
            <button type="submit" className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Mobile Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-2">
                  {searchResults.map((article) => (
                    <Link
                      key={article.articleId}
                      to={`/article/${article.articleId}`}
                      className="flex items-center px-4 py-2 hover:bg-gray-50"
                      onClick={() => setShowSearchResults(false)}
                    >
                      <img
                        src={article.thumbnailUrl || "https://via.placeholder.com/60x40"}
                        alt={article.title}
                        className="w-15 h-10 object-cover rounded mr-3"
                      />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{article.title}</h4>
                        {article.summary && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{article.summary}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile Loading Indicator */}
            {isSearching && (
              <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Categories Bar */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4">
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center justify-between py-4">
            <nav className="flex-1 flex items-center justify-between">
              <div className="flex-1 grid grid-cols-4 lg:grid-cols-8 gap-4 lg:gap-8">
                {!loading && categories.length > 0 && (
                  <>
                    {categories.map((category) => (
                      <div
                        key={category.categoryId}
                        className="relative group"
                        onMouseEnter={() => setActiveCategory(category.categoryId)}
                        onMouseLeave={() => setActiveCategory(null)}
                      >
                        <Link
                          to={`/category/${category.categoryId}`}
                          className="text-gray-600 hover:text-blue-600 hover:bg-gray-200 font-medium py-2 text-base block text-center relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-blue-600 after:left-1/2 after:bottom-0 after:transform after:-translate-x-1/2 after:transition-all after:duration-300 hover:after:w-full group-hover:text-blue-600 transition-colors duration-300"
                        >
                          {category.name}
                        </Link>
                        {/* Child Categories Dropdown */}
                        {activeCategory === category.categoryId && childCategories[category.categoryId]?.length > 0 && (
                          <div 
                            className="absolute left-1/2 transform -translate-x-1/2 top-[calc(100%-5px)] bg-white border border-gray-200 rounded-md shadow-lg py-2 min-w-[150px] z-[100] animate-fadeIn"
                            style={{
                              animation: 'fadeIn 0.2s ease-out, slideIn 0.2s ease-out'
                            }}
                          >
                            {childCategories[category.categoryId].map((child, index) => (
                              <Link
                                key={child.categoryId}
                                to={`/category/${child.categoryId}`}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 whitespace-nowrap text-center transition-all duration-200 hover:translate-x-1"
                                style={{
                                  animationDelay: `${index * 0.05}s`
                                }}
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
              
              <Link
                to="/categories"
                className="text-gray-700 hover:text-blue-600 font-medium flex items-center ml-8 text-base whitespace-nowrap transition-all duration-300 hover:scale-105"
              >
                <svg className="h-5 w-5 mr-1 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Danh Mục
              </Link>
              <Link
                to="/tags"
                className="text-gray-700 hover:text-blue-600 font-medium flex items-center ml-8 text-base whitespace-nowrap transition-all duration-300 hover:scale-105"
              >
                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Tags
              </Link>
            </nav>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center justify-between py-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-blue-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
            <div className="flex items-center space-x-4">
              <Link
                to="/categories"
                className="text-gray-700 hover:text-blue-600 font-medium flex items-center text-base"
              >
                Danh Mục
              </Link>
              <Link
                to="/tags"
                className="text-gray-700 hover:text-blue-600 font-medium flex items-center text-base"
              >
                Tags
              </Link>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200">
              <div className="py-2">
                {!loading && categories.length > 0 && categories.map((category) => (
                  <div key={category.categoryId} className="relative">
                    <Link
                      to={`/category/${category.categoryId}`}
                      className="block px-4 py-2 text-base text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                    {childCategories[category.categoryId]?.length > 0 && (
                      <div className="bg-gray-50 pl-8">
                        {childCategories[category.categoryId].map((child) => (
                          <Link
                            key={child.categoryId}
                            to={`/category/${child.categoryId}`}
                            className="block px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, 10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        
        @keyframes slideIn {
          from {
            transform: translate(-50%, 10px);
          }
          to {
            transform: translate(-50%, 0);
          }
        }
      `}</style>

      {/* Notification for editor request */}
      {requestSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          {requestSuccessMessage}
        </div>
      )}
    </header>
  );
}

export default Navigation;
