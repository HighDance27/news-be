import { useState } from "react";
import { addComment } from "../api";

function Comment({ articleId, comments, onCommentAdded }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);
  const isAuthenticated = !!localStorage.getItem("access_token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError("Vui lòng đăng nhập để bình luận");
      return;
    }

    try {
      await addComment(articleId, content);
      setContent("");
      setError(null);
      onCommentAdded();
    } catch {
      setError("Không thể gửi bình luận");
    }
  };

  const renderComments = (comments, level = 0) => {
    return comments.map((comment) => (
      <div key={comment.commentId} className={`ml-${level * 4} mb-4`}>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-800">{comment.content}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              {comment.author.name} -{" "}
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {renderComments(comment.replies, level + 1)}
            </div>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Bình luận</h3>
      {error && (
        <div className="bg-red-100 p-4 rounded-lg mb-4 text-red-700">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Viết bình luận..."
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          required
        />
        <button
          type="submit"
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Gửi bình luận
        </button>
      </form>
      <div className="space-y-4">{comments && renderComments(comments)}</div>
    </div>
  );
}

export default Comment;
