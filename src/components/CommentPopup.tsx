import React, { useState, useEffect, useRef } from 'react';

interface CommentPopupProps {
  onConfirm: (comment: { text: string; emoji?: string; priority?: 'low' | 'medium' | 'high' }) => void;
  onCancel: () => void;
  position: { x: number; y: number };
  initialComment?: { text: string; emoji?: string; priority?: 'low' | 'medium' | 'high' };
}

const CommentPopup: React.FC<CommentPopupProps> = ({
  onConfirm,
  onCancel,
  position,
  initialComment,
}) => {
  const [comment, setComment] = useState(initialComment?.text || '');
  const [selectedEmoji, setSelectedEmoji] = useState(initialComment?.emoji || '');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>(initialComment?.priority || 'medium');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const emojis = ['📝', '⚠️', '🔴', '🟡', '🟢', '❓', '💡', '📊', '📋', '✅'];

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (comment.trim()) {
      onConfirm({ text: comment.trim(), emoji: selectedEmoji, priority: selectedPriority });
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
        
        <div className="emoji-selector">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              className={`emoji-button ${selectedEmoji === emoji ? 'selected' : ''}`}
              onClick={() => setSelectedEmoji(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="priority-selector">
          <label>Priority:</label>
          <div className="priority-buttons">
            {(['low', 'medium', 'high'] as const).map((priority) => (
              <button
                key={priority}
                className={`priority-button priority-${priority} ${selectedPriority === priority ? 'selected' : ''}`}
                onClick={() => setSelectedPriority(priority)}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </button>
            ))}
          </div>
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