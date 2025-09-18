import React, { useState, useEffect, useRef } from 'react';

interface CommentPopupProps {
  onConfirm: (comment: { text: string }) => void;
  onCancel: () => void;
  position: { x: number; y: number };
  initialComment?: { text: string };
}

const CommentPopup: React.FC<CommentPopupProps> = ({
  onConfirm,
  onCancel,
  position,
  initialComment,
}) => {
  const [comment, setComment] = useState(initialComment?.text || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (comment.trim()) {
      onConfirm({ text: comment.trim() });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const popupStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: 1000,
  };

  return (
    <div className="comment-popup" style={popupStyle}>
      <div className="comment-popup-content">
        <div className="comment-popup-header">
          <h3>Add Comment</h3>
          <button className="close-button" onClick={onCancel}>
            ×
          </button>
        </div>
        

        
        <textarea
          ref={textareaRef}
          className="comment-textarea"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your comment..."
          rows={4}
        />
        
        <div className="comment-popup-footer">
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="confirm-button"
            onClick={handleSubmit}
            disabled={!comment.trim()}
          >
            Add Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentPopup;