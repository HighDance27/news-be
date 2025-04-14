import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getAdminArticles,
  publishArticle,
  getCategoriesTree,
  createParentCategory,
  createChildCategory,
  updateCategory,
  deleteCategory,
  getUsers,
  approveEditorRequest,
  changeUserRole,
  unpublishArticle,
  deleteArticle,
  getTags,
  deleteTag,
} from "../api";
import ArticleImage from "./ArticleImage";
import AdminStats from "./AdminStats";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("articles");
  const [articles, setArticles] = useState([]);
  const [editorRequests, setEditorRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userError, setUserError] = useState(null);
  const [userName, setUserName] = useState("");
  const [userPicture, setUserPicture] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Category management state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState("add"); // "add", "edit"
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryParentId, setCategoryParentId] = useState("");
  const [isParentCategory, setIsParentCategory] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [expandedCategories, setExpandedCategories] = useState({});

  // User management state
  const [showUserRoleModal, setShowUserRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [roleChangeLoading, setRoleChangeLoading] = useState(false);

  const [tags, setTags] = useState([]);
  const [showDeleteTagModal, setShowDeleteTagModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [tagsLoading, setTagsLoading] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    const picture = localStorage.getItem("user_picture");
    setUserName(name || "");
    setUserPicture(picture || "");

    // Fetch users and editor requests
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const response = await getUsers();
        if (Array.isArray(response.data)) {
          setUsers(response.data);
          // Filter out users with pending editor requests
          const pendingRequests = response.data.filter(
            (user) => user.editorRequestStatus === "PENDING"
          );
          setEditorRequests(pendingRequests);
        } else {
          console.error("Unexpected users API response format:", response.data);
          setUsers([]);
          setEditorRequests([]);
        }
        setUsersLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setUserError("Không thể tải danh sách người dùng");
        setUsersLoading(false);
      }
    };

    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        const response = await getCategoriesTree();
        if (Array.isArray(response)) {
          setCategories(response);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Không thể tải danh mục. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    // Fetch tags
    const fetchTags = async () => {
      try {
        const response = await getTags();
        if (response.data) {
          setTags(response.data);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    const fetchArticles = async () => {
      try {
        const response = await getAdminArticles(page, size, "title");
        if (response.data && response.data.content) {
          setArticles(response.data.content);
          setTotalPages(response.data.totalPages);
        } else {
          console.error("Unexpected articles API response format:", response.data);
          setArticles([]);
        }
        setLoading(false);
      } catch (error) {
        setError("Không thể tải danh sách bài viết");
        setLoading(false);
      }
    };

    fetchTags();
    fetchArticles();
    fetchCategories();
    fetchUsers();
  }, [page]);

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleApproveEditor = async (googleId) => {
    try {
      await approveEditorRequest(googleId);

      // Update the users list with the new role structure
      setUsers(
        users.map((user) =>
          user.googleId === googleId
            ? {
                ...user,
                role: {
                  ...user.role,
                  roleId: 3, // Editor role ID
                  roleName: "editor",
                  description: "Editor role",
                },
                editorRequestStatus: "APPROVED",
                editor: true,
              }
            : user
        )
      );

      // Remove from pending requests
      setEditorRequests(
        editorRequests.filter((req) => req.googleId !== googleId)
      );

      showNotification(`Đã phê duyệt biên tập viên với ID: ${googleId}`);
    } catch (error) {
      console.error("Error approving editor request:", error);
      showNotification(
        `Lỗi khi phê duyệt: ${error.message || "Đã xảy ra lỗi"}`,
        "error"
      );
    }
  };

  const handleRejectEditor = async (googleId) => {
    try {
      // No API for rejection, so we'll just use changeUserRole to ensure they stay as a user
      await changeUserRole(googleId, "user");

      // Update the users list with the new role structure
      setUsers(
        users.map((user) =>
          user.googleId === googleId
            ? {
                ...user,
                role: {
                  ...user.role,
                  roleId: 1, // User role ID
                  roleName: "user",
                  description: "Default user role",
                },
                editorRequestStatus: "REJECTED",
                editor: false,
              }
            : user
        )
      );

      // Remove from pending requests
      setEditorRequests(
        editorRequests.filter((req) => req.googleId !== googleId)
      );

      showNotification(`Đã từ chối yêu cầu biên tập viên với ID: ${googleId}`);
    } catch (error) {
      console.error("Error rejecting editor request:", error);
      showNotification(
        `Lỗi khi từ chối: ${error.message || "Đã xảy ra lỗi"}`,
        "error"
      );
    }
  };

  const handlePublish = async (articleId) => {
    try {
      await publishArticle(articleId);
      // Cập nhật trạng thái bài viết trực tiếp
      setArticles(
        articles.map((article) =>
          article.articleId === articleId
            ? { ...article, status: "PUBLISHED" }
            : article
        )
      );
      showNotification(`Đã xuất bản bài viết với ID: ${articleId}`);
    } catch (error) {
      console.error("Error publishing article:", error);
      showNotification("Không thể xuất bản bài viết", "error");
    }
  };

  const handleUnpublish = async (articleId) => {
    try {
      await unpublishArticle(articleId);
      // Cập nhật trạng thái bài viết trực tiếp
      setArticles(
        articles.map((article) =>
          article.articleId === articleId
            ? { ...article, status: "DRAFT" }
            : article
        )
      );
      showNotification(`Đã hủy xuất bản bài viết với ID: ${articleId}`);
    } catch (error) {
      console.error("Error unpublishing article:", error);
      showNotification("Không thể hủy xuất bản bài viết", "error");
    }
  };

  const handleDeleteArticle = async (articleId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        await deleteArticle(articleId);
        // Cập nhật danh sách bài viết sau khi xóa
        setArticles(articles.filter((article) => article.articleId !== articleId));
        showNotification(`Đã xóa bài viết với ID: ${articleId}`);
      } catch (error) {
        console.error("Error deleting article:", error);
        showNotification("Không thể xóa bài viết", "error");
      }
    }
  };

  // Category management functions
  const openAddCategoryModal = (isParent = true) => {
    setCategoryModalMode("add");
    setIsParentCategory(isParent);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryParentId(isParent ? "" : "");
    setSelectedCategory(null);
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (category) => {
    setCategoryModalMode("edit");
    setSelectedCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
    setIsParentCategory(category.parentId === null);
    setCategoryParentId(category.parentId ? category.parentId.toString() : "");
    setShowCategoryModal(true);
  };

  const closeModal = () => {
    setShowCategoryModal(false);
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    setCategoryLoading(true);

    try {
      const categoryData = {
        name: categoryName,
        description: categoryDescription,
      };

      let response;

      if (categoryModalMode === "add") {
        if (isParentCategory) {
          response = await createParentCategory(categoryData);
          showNotification("Đã thêm danh mục cha mới thành công!");
        } else {
          categoryData.parentId = parseInt(categoryParentId);
          response = await createChildCategory(categoryData);
          showNotification("Đã thêm danh mục con mới thành công!");
        }

        // Add the new category to the state
        if (response.data) {
          if (isParentCategory) {
            setCategories([...categories, response.data]);
          } else {
            // For child categories, need to update the parent's subcategories
            const updatedCategories = categories.map((cat) => {
              if (cat.categoryId === parseInt(categoryParentId)) {
                return {
                  ...cat,
                  subcategories: [...(cat.subcategories || []), response.data],
                };
              }
              return cat;
            });
            setCategories(updatedCategories);
          }
        }
      } else {
        // Edit mode
        if (selectedCategory) {
          if (!isParentCategory) {
            categoryData.parentId = parseInt(categoryParentId);
          } else {
            categoryData.parentId = 0; // 0 means it's a parent
          }

          await updateCategory(selectedCategory.categoryId, categoryData);
          showNotification("Đã cập nhật danh mục thành công!");

          // Refresh categories to get the updated data
          const refreshResponse = await getCategoriesTree();
          if (Array.isArray(refreshResponse)) {
            setCategories(refreshResponse);
          }
        }
      }

      // Reload categories after successful submission
      const reloadResponse = await getCategoriesTree();
      if (Array.isArray(reloadResponse)) {
        setCategories(reloadResponse);
      }

      closeModal();
    } catch (error) {
      console.error("Error saving category:", error);
      showNotification(
        `Lỗi khi ${
          categoryModalMode === "add" ? "thêm" : "cập nhật"
        } danh mục: ${error.message || "Đã xảy ra lỗi"}`,
        "error"
      );
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    // Find the category to check if it has subcategories
    const categoryToDelete = categories.find(cat => cat.categoryId === categoryId);
    
    if (categoryToDelete && categoryToDelete.subcategories && categoryToDelete.subcategories.length > 0) {
      showNotification("Yêu cầu xoá danh mục con trước", "error");
      return;
    }

    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa danh mục này? Mọi bài viết trong danh mục này sẽ không còn được phân loại."
      )
    ) {
      try {
        await deleteCategory(categoryId);
        // Reload categories after successful deletion
        const reloadResponse = await getCategoriesTree();
        if (Array.isArray(reloadResponse)) {
          setCategories(reloadResponse);
        }
        showNotification("Đã xóa danh mục thành công!");
      } catch (error) {
        console.error("Error deleting category:", error);
        showNotification(
          `Lỗi khi xóa danh mục: ${error.message || "Đã xảy ra lỗi"}`,
          "error"
        );
      }
    }
  };

  // Toggle expanded state for a category to show/hide its children
  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const openUserRoleModal = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.role?.roleName || "");
    setShowUserRoleModal(true);
  };

  const closeUserRoleModal = () => {
    setShowUserRoleModal(false);
    setSelectedUser(null);
    setSelectedRole("");
  };

  const handleRoleChange = async (e) => {
    e.preventDefault();

    if (!selectedUser || !selectedRole) {
      showNotification("Vui lòng chọn người dùng và vai trò", "error");
      return;
    }

    setRoleChangeLoading(true);

    try {
      await changeUserRole(selectedUser.googleId, selectedRole);

      // Get the role ID and description based on the selected role
      let roleId, description;
      switch (selectedRole) {
        case "admin":
          roleId = 2;
          description = "Admin user";
          break;
        case "editor":
          roleId = 3;
          description = "Editor role";
          break;
        case "user":
        default:
          roleId = 1;
          description = "Default user role";
          break;
      }

      // Update users list with new role
      setUsers(
        users.map((user) =>
          user.googleId === selectedUser.googleId
            ? {
                ...user,
                role: {
                  roleId,
                  roleName: selectedRole,
                  description,
                },
                editor: selectedRole === "editor",
              }
            : user
        )
      );

      showNotification(
        `Đã thay đổi vai trò của ${selectedUser.name} thành ${selectedRole}`
      );
      closeUserRoleModal();
    } catch (error) {
      console.error("Error changing user role:", error);
      showNotification(
        `Lỗi khi thay đổi vai trò: ${error.message || "Đã xảy ra lỗi"}`,
        "error"
      );
    } finally {
      setRoleChangeLoading(false);
    }
  };

  const handleCreateParentCategory = async (categoryData) => {
    try {
      await createParentCategory(categoryData);
      // Refresh categories to get the updated data
      const refreshResponse = await getCategoriesTree();
      if (Array.isArray(refreshResponse)) {
        setCategories(refreshResponse);
      }
    } catch (error) {
      console.error("Error creating parent category:", error);
    }
  };

  const renderCategory = (category, level = 0) => {
    const paddingLeft = level * 4; // 4 units of padding per level
    return (
      <div key={category.categoryId} className="mb-2">
        <div
          className={`flex items-center p-2 rounded-lg hover:bg-gray-50`}
          style={{ paddingLeft: `${paddingLeft}rem` }}
        >
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-500">{category.description}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => openEditCategoryModal(category)}
              className="text-blue-600 hover:text-blue-800"
            >
              Sửa
            </button>
            <button
              onClick={() => handleDeleteCategory(category.categoryId)}
              className="text-red-600 hover:text-red-800"
            >
              Xóa
            </button>
          </div>
        </div>
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="ml-4">
            {category.subcategories.map((subcategory) =>
              renderCategory(subcategory, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await deleteTag(tagId);
      setTags(tags.filter(tag => tag.tagId !== tagId));
      showNotification("Đã xóa tag thành công!");
      setShowDeleteTagModal(false);
    } catch (error) {
      console.error("Error deleting tag:", error);
      showNotification("Không thể xóa tag", "error");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Trang Quản Trị</h1>
          <div className="flex items-center">
            {userPicture && (
              <img
                src={userPicture}
                alt={userName}
                className="w-10 h-10 rounded-full mr-3 border-2 border-white"
              />
            )}
            <span className="font-medium">{userName}</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Notification */}
        {notification.show && (
          <div
            className={`mb-4 p-4 rounded-md ${
              notification.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {notification.message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("articles")}
                className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === "articles"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Quản lý bài viết
              </button>
              <button
                onClick={() => setActiveTab("editors")}
                className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === "editors"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Quản lý người dùng
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === "categories"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Quản lý danh mục
              </button>
              <button
                onClick={() => setActiveTab("stats")}
                className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === "stats"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Thống kê
              </button>
            </nav>
          </div>

          <div className="p-4">
            {activeTab === "articles" && (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Danh sách bài viết
                  </h2>
                  <div className="flex space-x-2">
                    <Link
                      to="/add-article"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                      Thêm bài viết mới
                    </Link>
                    <button
                      onClick={() => setShowDeleteTagModal(true)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                      Xóa Tag
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Thumbnail
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Tiêu đề
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Tác giả
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Trạng thái
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Ngày tạo
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {articles.map((article) => (
                        <tr key={article.articleId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-16 h-16 relative">
                              {article.thumbnailUrl ? (
                                <ArticleImage
                                  imageUrl={article.thumbnailUrl}
                                  thumbnailUrl={article.thumbnailUrl}
                                  alt={article.title}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                                  No image
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {article.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {article.authorName ||
                                article.authorEmail ||
                                "Không có tên"}
                              {article.authorAvatar && (
                                <img
                                  src={article.authorAvatar}
                                  alt={article.authorName}
                                  className="w-6 h-6 rounded-full inline-block ml-2"
                                />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                article.status === "PUBLISHED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {article.status === "PUBLISHED"
                                ? "Đã xuất bản"
                                : "Chưa xuất bản"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(article.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Link
                                to={`/edit-article/${article.articleId}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Sửa
                              </Link>
                              <button
                                onClick={() =>
                                  handleDeleteArticle(article.articleId)
                                }
                                className="text-red-600 hover:text-red-900"
                              >
                                Xóa
                              </button>
                              {article.status === "PUBLISHED" ? (
                                <button
                                  onClick={() =>
                                    handleUnpublish(article.articleId)
                                  }
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Hủy xuất bản
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handlePublish(article.articleId)
                                  }
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Xuất bản
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add pagination controls */}
                {totalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between">
                      <button
                        onClick={handlePrevPage}
                        disabled={page === 0}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                          page === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-blue-50"
                        }`}
                      >
                        Trang trước
                      </button>
                      <div className="text-m text-blue-900">
                        Trang {page + 1} / {totalPages}
                      </div>
                      <button
                        onClick={handleNextPage}
                        disabled={page >= totalPages - 1}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                          page >= totalPages - 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-blue-50"
                        }`}
                      >
                        Trang sau
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "editors" && (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Quản lý người dùng
                  </h2>
                </div>

                {userError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {userError}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Yêu cầu phê duyệt biên tập viên
                  </h3>

                  {usersLoading ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      <p className="mt-2 text-gray-500">Đang tải...</p>
                    </div>
                  ) : editorRequests.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Ảnh
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Tên
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Email
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Ngày yêu cầu
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {editorRequests.map((request) => (
                            <tr key={request.googleId}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {request.avatarUrl ? (
                                  <img
                                    src={request.avatarUrl}
                                    alt={request.name}
                                    className="h-10 w-10 rounded-full"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500 font-medium">
                                      {request.name
                                        ? request.name.charAt(0).toUpperCase()
                                        : "U"}
                                    </span>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {request.name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {request.email}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {request.createdDate
                                  ? new Date(
                                      request.createdDate
                                    ).toLocaleDateString("vi-VN")
                                  : "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() =>
                                    handleApproveEditor(request.googleId)
                                  }
                                  className="text-green-600 hover:text-green-900 mr-3"
                                >
                                  Phê duyệt
                                </button>
                                <button
                                  onClick={() =>
                                    handleRejectEditor(request.googleId)
                                  }
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Từ chối
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">
                        Không có yêu cầu phê duyệt nào
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-10">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Tất cả người dùng
                  </h3>

                  {usersLoading ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      <p className="mt-2 text-gray-500">Đang tải...</p>
                    </div>
                  ) : users.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Ảnh
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Tên
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Email
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Vai trò
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Ngày đăng ký
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((user) => (
                            <tr key={user.googleId}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {user.avatarUrl ? (
                                  <img
                                    src={user.avatarUrl}
                                    alt={user.name}
                                    className="h-10 w-10 rounded-full"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500 font-medium">
                                      {user.name
                                        ? user.name.charAt(0).toUpperCase()
                                        : "U"}
                                    </span>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {user.email}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    user.role?.roleName === "admin"
                                      ? "bg-purple-100 text-purple-800"
                                      : user.role?.roleName === "editor"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {user.role?.roleName === "admin"
                                    ? "Quản trị viên"
                                    : user.role?.roleName === "editor"
                                    ? "Biên tập viên"
                                    : "Người dùng"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {user.createdDate
                                  ? new Date(
                                      user.createdDate
                                    ).toLocaleDateString("vi-VN")
                                  : "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => openUserRoleModal(user)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Thay đổi vai trò
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">
                        Không có người dùng nào
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "categories" && (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Quản lý danh mục
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openAddCategoryModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                      Thêm danh mục cha
                    </button>
                    <button
                      onClick={() => openAddCategoryModal(false)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                      disabled={categories.length === 0}
                      title={
                        categories.length === 0
                          ? "Cần có ít nhất một danh mục cha"
                          : ""
                      }
                    >
                      Thêm danh mục con
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {categories.length > 0 ? (
                    categories.map((category) => renderCategory(category))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      Chưa có danh mục nào được tạo.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "stats" && <AdminStats />}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
            &#8203;
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {categoryModalMode === "add"
                        ? isParentCategory
                          ? "Thêm danh mục cha mới"
                          : "Thêm danh mục con mới"
                        : "Chỉnh sửa danh mục"}
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleSubmitCategory}>
                        <div className="mb-4">
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Tên danh mục
                          </label>
                          <input
                            type="text"
                            id="name"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                          />
                        </div>
                        <div className="mb-4">
                          <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Mô tả
                          </label>
                          <textarea
                            id="description"
                            rows="3"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={categoryDescription}
                            onChange={(e) =>
                              setCategoryDescription(e.target.value)
                            }
                          ></textarea>
                        </div>

                        {!isParentCategory && (
                          <div className="mb-4">
                            <label
                              htmlFor="parentId"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Danh mục cha
                            </label>
                            <select
                              id="parentId"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                              value={categoryParentId}
                              onChange={(e) =>
                                setCategoryParentId(e.target.value)
                              }
                            >
                              <option value="">-- Chọn danh mục cha --</option>
                              {categories
                                .filter(
                                  (cat) =>
                                    cat.parentId === null &&
                                    (!selectedCategory ||
                                      cat.categoryId !==
                                        selectedCategory.categoryId)
                                )
                                .map((cat) => (
                                  <option
                                    key={cat.categoryId}
                                    value={cat.categoryId}
                                  >
                                    {cat.name}
                                  </option>
                                ))}
                            </select>
                          </div>
                        )}

                        {categoryModalMode === "edit" && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                              Loại danh mục
                            </label>
                            <div className="mt-2">
                              <label className="inline-flex items-center mr-4">
                                <input
                                  type="radio"
                                  className="form-radio"
                                  name="categoryType"
                                  checked={isParentCategory}
                                  onChange={() => {
                                    setIsParentCategory(true);
                                    setCategoryParentId("");
                                  }}
                                />
                                <span className="ml-2">Danh mục cha</span>
                              </label>
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  className="form-radio"
                                  name="categoryType"
                                  checked={!isParentCategory}
                                  onChange={() => setIsParentCategory(false)}
                                />
                                <span className="ml-2">Danh mục con</span>
                              </label>
                            </div>
                          </div>
                        )}

                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                            disabled={categoryLoading}
                          >
                            {categoryLoading ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                                Đang xử lý...
                              </>
                            ) : categoryModalMode === "add" ? (
                              "Thêm danh mục"
                            ) : (
                              "Cập nhật"
                            )}
                          </button>
                          <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                            onClick={closeModal}
                          >
                            Hủy
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Role Modal */}
      {showUserRoleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
            &#8203;
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Thay đổi vai trò người dùng
                    </h3>
                    {selectedUser && (
                      <div className="mt-2 mb-4">
                        <div className="flex items-center">
                          {selectedUser.avatarUrl ? (
                            <img
                              src={selectedUser.avatarUrl}
                              alt={selectedUser.name}
                              className="h-10 w-10 rounded-full mr-4"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                              <span className="text-gray-500 font-medium">
                                {selectedUser.name
                                  ? selectedUser.name.charAt(0).toUpperCase()
                                  : "U"}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedUser.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {selectedUser.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="mt-4">
                      <form onSubmit={handleRoleChange}>
                        <div className="mb-4">
                          <label
                            htmlFor="role"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Vai trò
                          </label>
                          <select
                            id="role"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                          >
                            <option value="">-- Chọn vai trò --</option>
                            <option value="user">Người dùng</option>
                            <option value="editor">Biên tập viên</option>
                            <option value="admin">Quản trị viên</option>
                          </select>
                        </div>

                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                            disabled={roleChangeLoading}
                          >
                            {roleChangeLoading ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                                Đang xử lý...
                              </>
                            ) : (
                              "Lưu thay đổi"
                            )}
                          </button>
                          <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                            onClick={closeUserRoleModal}
                          >
                            Hủy
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Tag Modal */}
      {showDeleteTagModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
            &#8203;
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Xóa Tag
                    </h3>
                    <div className="mt-4">
                      <div className="mb-4">
                        <label
                          htmlFor="tag"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Chọn tag cần xóa
                        </label>
                        <select
                          id="tag"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          value={selectedTag?.tagId || ""}
                          onChange={(e) => {
                            const tag = tags.find(t => t.tagId === parseInt(e.target.value));
                            setSelectedTag(tag);
                          }}
                        >
                          <option value="">-- Chọn tag --</option>
                          {tags.map((tag) => (
                            <option key={tag.tagId} value={tag.tagId}>
                              {tag.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="button"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                          onClick={() => selectedTag && handleDeleteTag(selectedTag.tagId)}
                          disabled={!selectedTag}
                        >
                          Xóa
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                          onClick={() => setShowDeleteTagModal(false)}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
