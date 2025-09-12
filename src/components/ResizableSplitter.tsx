import React, { useState, useCallback, useRef, useEffect } from 'react';

interface ResizableSplitterProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  initialLeftWidth?: number;
  minLeftWidth?: number;
  minRightWidth?: number;
  className?: string;
}

const ResizableSplitter: React.FC<ResizableSplitterProps> = ({
  leftPanel,
  rightPanel,
  initialLeftWidth = 40,
  minLeftWidth = 300,
  minRightWidth = 400,
  className = '',
}) => {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const splitterRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const mouseX = e.clientX - containerRect.left;

      const newLeftWidth = Math.max(
        minLeftWidth,
        Math.min(
          containerWidth - minRightWidth,
          mouseX
        )
      );

      const newLeftPercentage = (newLeftWidth / containerWidth) * 100;
      setLeftWidth(Math.min(Math.max(newLeftPercentage, 20), 70));
    },
    [isDragging, minLeftWidth, minRightWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div 
      ref={containerRef}
      className={`resizable-splitter-container ${className}`}
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
      }}
    >
      <div 
        className="resizable-left-panel"
        style={{
          width: `${leftWidth}%`,
          minWidth: `${minLeftWidth}px`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {leftPanel}
      </div>
      
      <div
        ref={splitterRef}
        className={`resizable-splitter ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        style={{
          width: '4px',
          backgroundColor: isDragging ? '#007bff' : '#e0e0e0',
          cursor: 'col-resize',
          position: 'relative',
          flexShrink: 0,
          transition: isDragging ? 'none' : 'background-color 0.2s',
        }}
      >
        <div
          className="splitter-handle"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '20px',
            height: '40px',
            background: isDragging ? '#007bff' : '#ccc',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            color: 'white',
            transition: isDragging ? 'none' : 'all 0.2s',
          }}
        >
          ⋮⋮
        </div>
      </div>
      
      <div 
        className="resizable-right-panel"
        style={{
          flex: 1,
          minWidth: `${minRightWidth}px`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {rightPanel}
      </div>
    </div>
  );
};

export default ResizableSplitter;