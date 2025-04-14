import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CKEditor, useCKEditorCloud } from "@ckeditor/ckeditor5-react";
import {
  getArticleById,
  updateArticle,
  createArticle,
  getTags,
  getCategoriesTree,
} from "../api";
import axios from "axios";
import "./ArticleEditor.css";

const LICENSE_KEY =
  "eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NDUxOTM1OTksImp0aSI6ImY1ZjFlMDBiLTg2OGYtNDcxMC1hOGJjLWE5Y2M4NTA5ZTUzMSIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6Ijg0MzM2ZTdlIn0.fgYNUYjNgQzOX3MGe7WueZb__vFwqGG12_8zwouku1vWuYnA1rYVeDbaCCpmmyzmPgubYnpAKEMIOKsyQrUVHA";

const CLOUD_SERVICES_TOKEN_URL =
  "https://fg2utwnynvdm.cke-cs.com/token/dev/26042496a5775024df171d8b95af043c43829e9a4565de9808a06fcbf08b?limit=10";

function EditArticle() {
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    categoryId: "",
    tagNames: [],
    thumbnailUrl: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [availableTags, setAvailableTags] = useState([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [thumbPreview, setThumbPreview] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [categories, setCategories] = useState([]);

  const cloud = useCKEditorCloud({
    version: "44.3.0",
    ckbox: { version: "2.6.1" },
  });

  useEffect(() => {
    setIsLayoutReady(true);
    if (isEditMode) {
      fetchArticle();
    }
    fetchTags();
    fetchCategories();

    return () => setIsLayoutReady(false);
  }, [id, isEditMode]);

  // Function để refresh token khi access token hết hạn
  const refreshToken = async () => {
    try {
      const refreshTokenValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith("refresh_token="))
        ?.split("=")[1];

      if (!refreshTokenValue) {
        throw new Error("Refresh token not found");
      }

      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL,
        {},
        {
          headers: {
            accept: "application/json",
            Cookie: `refresh_token=${refreshTokenValue}`,
          },
        }
      );

      const { access_token } = response.data;
      localStorage.setItem("access_token", access_token);
      return access_token;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      // Redirect to login if refresh token is invalid
      navigate("/login");
      throw error;
    }
  };

  const fetchArticle = async () => {
    try {
      console.log("Fetching article with ID:", id);
      const response = await getArticleById(id);
      console.log("Article data:", response.data);
      const article = response.data;

      setFormData({
        title: article.title || "",
        summary: article.summary || "",
        content: article.content || "",
        categoryId: article.category?.categoryId || "",
        tagNames: article.tags?.map(tag => tag.name) || [], // Ensure we get tag names from the response
        thumbnailUrl: article.thumbnailUrl || "",
      });

      console.log("Initial formData with tags:", {
        ...formData,
        tagNames: article.tags?.map(tag => tag.name) || []
      });

      if (article.thumbnailUrl) {
        setThumbPreview(article.thumbnailUrl);
      }
    } catch (err) {
      console.error("Error fetching article:", err);
      setError("Không thể tải bài viết");
    }
  };

  const fetchTags = async () => {
    try {
      const response = await getTags();
      setAvailableTags(response.data || []);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Không thể tải danh sách tags");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategoriesTree();
      setCategories(response || []);
    } catch (err) {
      console.error("Error loading categories:", err);
      setError("Không thể tải danh sách danh mục");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagKeyPress = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tagNames.includes(tagInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          tagNames: [...prev.tagNames, tagInput.trim()],
        }));
      }
      setTagInput("");
    }
  };

  const addTagFromSuggestion = (tagName) => {
    if (!formData.tagNames.includes(tagName)) {
      setFormData((prev) => ({
        ...prev,
        tagNames: [...prev.tagNames, tagName],
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tagNames: prev.tagNames.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Hiển thị tất cả tags có sẵn
  const toggleTagDropdown = () => {
    setShowTagDropdown(!showTagDropdown);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    // Create a preview of the image
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result;
      setThumbPreview(base64data);
    };
    reader.readAsDataURL(file);

    // Upload the file directly without converting to base64
    try {
      console.log("Uploading thumbnail to server...");

      // Create FormData directly from the file
      const formData = new FormData();
      formData.append("file", file);

      // Use axios directly to bypass our API wrapper for this special case
      axios
        .post(`${import.meta.env.VITE_BACKEND_URL}/upload-image`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })
        .then((response) => {
          console.log("Upload response:", response);

          // Extract URL from response - handle different possible response structures
          let imageUrl = null;
          if (response.data && typeof response.data === "object") {
            // Try to find URL in common properties
            imageUrl =
              response.data.url ||
              response.data.imageUrl ||
              response.data.thumbnailUrl ||
              response.data.link;

            // If still not found, look for any property that might contain a URL
            if (!imageUrl) {
              for (const key in response.data) {
                if (
                  typeof response.data[key] === "string" &&
                  (response.data[key].startsWith("http") ||
                    response.data[key].startsWith("/"))
                ) {
                  imageUrl = response.data[key];
                  console.log(`Found URL in property: ${key}`);
                  break;
                }
              }
            }
          } else if (typeof response.data === "string") {
            // If response.data is directly a string URL
            imageUrl = response.data;
          }

          if (imageUrl) {
            console.log("Successfully extracted image URL:", imageUrl);
            setFormData((prev) => ({
              ...prev,
              thumbnailUrl: imageUrl,
            }));
          } else {
            console.error("Could not extract URL from response:", response);
            setError(
              "Received response from server but couldn't extract image URL"
            );
          }
        })
        .catch((error) => {
          console.error("Error uploading thumbnail:", error);
          setError(
            "Failed to upload thumbnail image, but you can still save the article."
          );
        });
    } catch (error) {
      console.error("Error setting up thumbnail upload:", error);
      setError("Failed to set up thumbnail upload.");
    }
  };
  const navigateCancel = () =>{
    // Get user role from localStorage
    const userRole = localStorage.getItem("role");
        
    // Navigate based on user role
    if (userRole === "admin") {
       navigate("/admin-dashboard");
    } else if (userRole === "editor") {
      navigate("/editor-dashboard");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage("");

    try {
      // Log current formData including tags
      console.log("Current formData before submission:", {
        ...formData,
        tagNames: formData.tagNames || []
      });

      let articleData = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        categoryId: formData.categoryId || 0,
        tags: formData.tagNames || [], // Change tagNames to tags for updateArticle
        thumbnailUrl: formData.thumbnailUrl,
      };

      // Log the data being sent to the API
      console.log("Data being sent to API:", articleData);

      let articleId;

      if (isEditMode) {
        // Sửa bài viết
        const response = await updateArticle(id, articleData);
        console.log("Update article response:", response);
        articleId = id;
      } else {
        // Thêm mới bài viết - keep using tagNames for createArticle
        const createData = {
          ...articleData,
          tagNames: articleData.tags,
          tags: undefined
        };
        const response = await createArticle(createData);
        console.log("Create article response:", response);
        articleId = response.data.articleId;
      }

      setSuccessMessage(
        `Bài viết đã được ${isEditMode ? "cập nhật" : "tạo"} thành công`
      );

      // Get user role from localStorage
      const userRole = localStorage.getItem("role");
      
      // Navigate based on user role
      if (userRole === "admin") {
        setTimeout(() => navigate("/admin-dashboard"), 2000);
      } else if (userRole === "editor") {
        setTimeout(() => navigate("/editor-dashboard"), 2000);
      } else {
        setTimeout(() => navigate("/dashboard"), 2000);
      }
    } catch (err) {
      console.error("Error updating article:", err);
      setError(
        err.response?.data?.message ||
          `Không thể ${isEditMode ? "cập nhật" : "tạo"} bài viết`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const { ClassicEditor, editorConfig } = useMemo(() => {
    if (cloud.status !== "success" || !isLayoutReady) {
      return {};
    }

    const {
      ClassicEditor,
      Autoformat,
      AutoImage,
      Autosave,
      BlockQuote,
      Bold,
      CKBox,
      CKBoxImageEdit,
      CloudServices,
      Emoji,
      Essentials,
      Heading,
      ImageBlock,
      ImageCaption,
      ImageInline,
      ImageInsert,
      ImageInsertViaUrl,
      ImageResize,
      ImageStyle,
      ImageTextAlternative,
      ImageToolbar,
      ImageUpload,
      Indent,
      IndentBlock,
      Italic,
      Link,
      LinkImage,
      List,
      ListProperties,
      MediaEmbed,
      Mention,
      Paragraph,
      PasteFromOffice,
      PictureEditing,
      Table,
      TableCaption,
      TableCellProperties,
      TableColumnResize,
      TableProperties,
      TableToolbar,
      TextTransformation,
      TodoList,
      Underline,
    } = cloud.CKEditor;

    return {
      ClassicEditor,
      editorConfig: {
        toolbar: {
          items: [
            "heading",
            "|",
            "bold",
            "italic",
            "underline",
            "|",
            "emoji",
            "link",
            "insertImage",
            "ckbox",
            "mediaEmbed",
            "insertTable",
            "blockQuote",
            "|",
            "bulletedList",
            "numberedList",
            "todoList",
            "outdent",
            "indent",
          ],
          shouldNotGroupWhenFull: false,
        },
        plugins: [
          Autoformat,
          AutoImage,
          Autosave,
          BlockQuote,
          Bold,
          CKBox,
          CKBoxImageEdit,
          CloudServices,
          Emoji,
          Essentials,
          Heading,
          ImageBlock,
          ImageCaption,
          ImageInline,
          ImageInsert,
          ImageInsertViaUrl,
          ImageResize,
          ImageStyle,
          ImageTextAlternative,
          ImageToolbar,
          ImageUpload,
          Indent,
          IndentBlock,
          Italic,
          Link,
          LinkImage,
          List,
          ListProperties,
          MediaEmbed,
          Mention,
          Paragraph,
          PasteFromOffice,
          PictureEditing,
          Table,
          TableCaption,
          TableCellProperties,
          TableColumnResize,
          TableProperties,
          TableToolbar,
          TextTransformation,
          TodoList,
          Underline,
        ],
        cloudServices: {
          tokenUrl: CLOUD_SERVICES_TOKEN_URL,
        },
        heading: {
          options: [
            {
              model: "paragraph",
              title: "Paragraph",
              class: "ck-heading_paragraph",
            },
            {
              model: "heading1",
              view: "h1",
              title: "Heading 1",
              class: "ck-heading_heading1",
            },
            {
              model: "heading2",
              view: "h2",
              title: "Heading 2",
              class: "ck-heading_heading2",
            },
            {
              model: "heading3",
              view: "h3",
              title: "Heading 3",
              class: "ck-heading_heading3",
            },
          ],
        },
        image: {
          toolbar: [
            "toggleImageCaption",
            "imageTextAlternative",
            "|",
            "imageStyle:inline",
            "imageStyle:wrapText",
            "imageStyle:breakText",
            "|",
            "resizeImage",
            "|",
            "ckboxImageEdit",
          ],
        },
        licenseKey: LICENSE_KEY,
        link: {
          addTargetToExternalLinks: true,
          defaultProtocol: "https://",
        },
        mediaEmbed: {
          previewsInData: true,
        },
        // Thêm cấu hình để cải thiện giao diện
        fontSize: {
          options: [
            9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
          ],
        },
        fontFamily: {
          options: [
            "default",
            "Arial, Helvetica, sans-serif",
            "Courier New, Courier, monospace",
            "Georgia, serif",
            "Lucida Sans Unicode, Lucida Grande, sans-serif",
            "Tahoma, Geneva, sans-serif",
            "Times New Roman, Times, serif",
            "Trebuchet MS, Helvetica, sans-serif",
            "Verdana, Geneva, sans-serif",
          ],
        },
        fontColor: {
          colors: [
            { color: "#000000", label: "Black" },
            { color: "#4D4D4D", label: "Dim grey" },
            { color: "#999999", label: "Grey" },
            { color: "#E6E6E6", label: "Light grey" },
            { color: "#FFFFFF", label: "White" },
            { color: "#1ABC9C", label: "Aqua" },
            { color: "#2ECC71", label: "Green" },
            { color: "#3498DB", label: "Blue" },
            { color: "#9B59B6", label: "Purple" },
            { color: "#e74c3c", label: "Red" },
          ],
        },
      },
    };
  }, [cloud, isLayoutReady]);

  const renderCategoryOptions = (categories, level = 0) => {
    return categories.map((category) => (
      <React.Fragment key={category.categoryId}>
        <option value={category.categoryId}>
          {'\u00A0'.repeat(level * 2)}{level > 0 ? '└ ' : ''}{category.name}
        </option>
        {category.subcategories && category.subcategories.length > 0 && (
          renderCategoryOptions(category.subcategories, level + 1)
        )}
      </React.Fragment>
    ));
  };

  return (
    <div className="editor-container">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Quay lại
      </button>

      <h1 className="editor-title">
        {isEditMode ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
      </h1>

      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <form onSubmit={handleSubmit} className="article-form">
        <div className="form-group">
          <label htmlFor="title">Tiêu đề bài viết</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="form-control"
            placeholder="Nhập tiêu đề bài viết"
          />
        </div>

        <div className="form-group">
          <label htmlFor="summary">Tóm tắt</label>
          <textarea
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleInputChange}
            required
            className="form-control"
            rows="3"
            placeholder="Nhập tóm tắt bài viết"
          />
        </div>

        <div className="form-group">
          <label htmlFor="thumbnail">Thumbnail Image</label>
          <div className="thumbnail-container">
            <input
              type="file"
              id="thumbnail"
              ref={fileInputRef}
              onChange={handleThumbnailChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              className="thumbnail-select-button"
              onClick={() => fileInputRef.current.click()}
            >
              Choose Image
            </button>
            {thumbPreview && (
              <div className="thumbnail-preview">
                <img
                  src={thumbPreview}
                  alt="Thumbnail preview"
                  className="thumbnail-image"
                />
                <button
                  type="button"
                  className="thumbnail-remove"
                  onClick={() => {
                    setThumbPreview("");
                    setFormData((prev) => ({
                      ...prev,
                      thumbnailUrl: "",
                    }));
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <p className="thumbnail-info">
            Recommended size: 800x400 pixels. Max size: 5MB.
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="categoryId">Danh mục</label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleInputChange}
            required
            className="form-control"
          >
            <option value="">-- Chọn danh mục --</option>
            {renderCategoryOptions(categories)}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags</label>
          <div className="tags-input-container">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyPress={handleTagKeyPress}
              className="form-control"
              placeholder="Nhập tag và nhấn Enter"
            />

            {/* Nút mở dropdown chọn tag từ database */}
            <button
              type="button"
              className="tags-dropdown-toggle"
              onClick={toggleTagDropdown}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Chọn từ danh sách
            </button>

            {/* Hiển thị thẻ đã chọn */}
            <div className="tags-container">
              {formData.tagNames.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Hiển thị gợi ý tags khi gõ */}
            {tagInput.length > 0 && (
              <div className="tag-suggestions">
                {availableTags
                  .filter(
                    (tag) =>
                      tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
                      !formData.tagNames.includes(tag.name)
                  )
                  .slice(0, 5)
                  .map((tag) => (
                    <div
                      key={tag.tagId}
                      className="tag-suggestion-item"
                      onClick={() => {
                        addTagFromSuggestion(tag.name);
                        setTagInput("");
                      }}
                    >
                      {tag.name}
                    </div>
                  ))}
              </div>
            )}

            {/* Dropdown để hiển thị tất cả tags có sẵn từ database */}
            {showTagDropdown && (
              <div className="tag-dropdown">
                <div className="tag-dropdown-header">
                  Chọn tags từ danh sách
                </div>
                <div className="available-tags-container">
                  {availableTags
                    .filter((tag) => !formData.tagNames.includes(tag.name))
                    .map((tag) => (
                      <div
                        key={tag.tagId}
                        className="available-tag"
                        onClick={() => {
                          addTagFromSuggestion(tag.name);
                          // Không đóng dropdown để có thể chọn nhiều tag
                        }}
                      >
                        {tag.name}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Nội dung bài viết</label>
          <div className="editor-wrapper">
            <div
              className="editor-container_classic-editor"
              ref={editorContainerRef}
            >
              <div className="editor-container__editor">
                <div ref={editorRef}>
                  {ClassicEditor && editorConfig && (
                    <CKEditor
                      editor={ClassicEditor}
                      config={editorConfig}
                      data={formData.content}
                      onReady={(editor) => {
                        editorRef.current = editor;
                        console.log("Editor đã sẵn sàng!");

                        // Nếu đang ở chế độ chỉnh sửa và có dữ liệu, cập nhật nội dung editor
                        if (isEditMode && formData.content) {
                          editor.setData(formData.content);
                        }
                      }}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setFormData((prev) => ({
                          ...prev,
                          content: data,
                        }));
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={navigateCancel}
            className="cancel-button"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Đang xử lý..."
              : isEditMode
              ? "Lưu thay đổi"
              : "Đăng bài"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditArticle;
