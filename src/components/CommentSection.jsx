import React, { useState, useEffect } from "react";
import {
  getCommentsByArticleId,
  createComment,
  updateComment,
  deleteComment,
} from "../api";

function CommentSection({ articleId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const isLoggedIn = !!localStorage.getItem("access_token");
  const userName = localStorage.getItem("user_name");
  const userEmail = localStorage.getItem("user_email");
  const userPicture = localStorage.getItem("user_picture");
  const userGoogleId = localStorage.getItem("google_id");

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await getCommentsByArticleId(articleId);
      console.log("Comments data:", response.data);
      setComments(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Không thể tải bình luận");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createComment(articleId, newComment);
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error submitting comment:", error);
      setError("Không thể gửi bình luận. Vui lòng thử lại.");
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      await createComment(articleId, replyContent, replyingTo.commentId);
      setReplyContent("");
      setReplyingTo(null);
      fetchComments();
    } catch (error) {
      console.error("Error replying to comment:", error);
      setError("Không thể gửi trả lời. Vui lòng thử lại.");
    }
  };

  const handleEditComment = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;

    try {
      setSubmitting(true);
      const response = await updateComment(
        editingComment.commentId,
        editContent
      );
      console.log("Comment updated:", response.data);

      await fetchComments();

      setEditingComment(null);
      setEditContent("");
    } catch (err) {
      console.error("Error updating comment:", err);
      setError("Không thể cập nhật bình luận");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;

    try {
      await deleteComment(commentId);
      setComments(
        comments.filter((comment) => comment.commentId !== commentId)
      );
      await fetchComments();
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Không thể xóa bình luận");
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

  const canEditComment = (comment) => {
    if (!isLoggedIn) return false;
    return comment.author?.googleId === userGoogleId;
  };

  const renderComment = (comment) => (
    <div key={comment.commentId} className="flex space-x-4">
      <div className="flex-shrink-0">
        {comment.author?.avatarUrl ? (
          <img
            src={comment.author.avatarUrl}
            alt={comment.author.name || comment.author.email}
            className="h-10 w-10 rounded-full"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-600 font-medium">
              {comment.author?.name?.charAt(0) ||
                comment.author?.email?.charAt(0) ||
                "U"}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {editingComment?.commentId === comment.commentId ? (
          <form onSubmit={handleEditComment} className="mb-2">
            <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 mb-2">
              <textarea
                rows="3"
                className="block w-full py-2 px-3 border-0 resize-none focus:ring-0 focus:outline-none sm:text-sm"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={submitting || !editContent.trim()}
                className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md shadow-sm text-white ${
                  submitting || !editContent.trim()
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {submitting ? "Đang lưu..." : "Lưu"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingComment(null);
                  setEditContent("");
                }}
                className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Hủy
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between mb-1">
                <div className="font-medium text-gray-900">
                  {comment.author?.name || comment.author?.email || "Ẩn danh"}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(comment.createdAt)}
                </div>
              </div>
              <div className="text-gray-700 whitespace-pre-line">
                {comment.content}
              </div>
            </div>
            <div className="mt-1 flex justify-between items-center">
              {isLoggedIn && (
                <button
                  onClick={() => setReplyingTo(comment)}
                  className="text-xs text-gray-500 hover:text-blue-600"
                >
                  Trả lời
                </button>
              )}
              {canEditComment(comment) && (
                <div className="flex space-x-2 text-xs">
                  <button
                    onClick={() => {
                      setEditingComment(comment);
                      setEditContent(comment.content);
                    }}
                    className="text-gray-500 hover:text-blue-600"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.commentId)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    Xóa
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Reply form */}
        {replyingTo?.commentId === comment.commentId && (
          <form onSubmit={handleReply} className="mt-4 ml-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {userPicture ? (
                  <img
                    src={userPicture}
                    alt={userName || userEmail}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {userName?.charAt(0) || userEmail?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                  <textarea
                    rows="2"
                    className="block w-full py-2 px-3 border-0 resize-none focus:ring-0 focus:outline-none sm:text-sm"
                    placeholder="Viết trả lời của bạn..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    required
                  ></textarea>
                  <div className="py-2 px-3 bg-gray-50 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent("");
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={!replyContent.trim()}
                      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-md shadow-sm text-white ${
                        !replyContent.trim()
                          ? "bg-blue-300 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      Gửi trả lời
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 ml-8 space-y-4">
            {comment.replies.map((reply) => renderComment(reply))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Bình luận</h2>

      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-4">
          <div className="text-red-600">{error}</div>
        </div>
      )}

      {/* Comment form */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {userPicture ? (
                <img
                  src={userPicture}
                  alt={userName || userEmail}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {userName?.charAt(0) || userEmail?.charAt(0) || "U"}
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <textarea
                  rows="3"
                  name="comment"
                  id="comment"
                  className="block w-full py-3 px-4 border-0 resize-none focus:ring-0 focus:outline-none sm:text-sm"
                  placeholder="Viết bình luận của bạn..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                ></textarea>
                <div className="py-2 px-4 bg-gray-50 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Bình luận với tư cách {userName || userEmail}
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      submitting || !newComment.trim()
                        ? "bg-blue-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    }`}
                  >
                    {submitting ? "Đang gửi..." : "Gửi bình luận"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">
            Vui lòng{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              đăng nhập
            </a>{" "}
            để bình luận.
          </p>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => renderComment(comment))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Chưa có bình luận nào. Hãy để lại bình luận đầu tiên!
        </div>
      )}
    </div>
  );
}

export default CommentSection;
