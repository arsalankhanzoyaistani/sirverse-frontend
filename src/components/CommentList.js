import React from "react";

export default function CommentList({ comments }) {
  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <div key={c.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-700">{c.user.username}</div>
          <div className="text-gray-800 mt-1">{c.content}</div>
        </div>
      ))}
    </div>
  );
}
