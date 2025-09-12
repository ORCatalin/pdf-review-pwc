import React, { useState, useRef, useEffect } from 'react';
import type { RectangleWithComment } from '../types/index';

interface DragRectangleProps {
  pageNumber: number;
  onRectangleDrawn: (rectangle: RectangleWithComment) => void;
  isEnabled: boolean;
  onRequestComment: (rectangle: Omit<RectangleWithComment, 'id' | 'comment'>) => void;
}

const DragRectangle: React.FC<DragRectangleProps> = ({
  pageNumber,
  isEnabled,
  onRequestComment,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [endPoint, setEndPoint] = useState({ x: 0, y: 0 });
  const [rectangles] = useState<RectangleWithComment[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEnabled) return;
    
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });
    setEndPoint({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !isEnabled) return;

    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setEndPoint({ x, y });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !isEnabled) return;

    const rectangleData = {
      startX: Math.min(startPoint.x, endPoint.x),
      startY: Math.min(startPoint.y, endPoint.y),
      endX: Math.max(startPoint.x, endPoint.x),
      endY: Math.max(startPoint.y, endPoint.y),
      pageNumber,
    };

    // Only create rectangle if it's large enough
    if (Math.abs(rectangleData.endX - rectangleData.startX) > 5 && 
        Math.abs(rectangleData.endY - rectangleData.startY) > 5) {
      // Request comment for the rectangle
      onRequestComment(rectangleData);
    }

    setIsDrawing(false);
    setStartPoint({ x: 0, y: 0 });
    setEndPoint({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDrawing) {
        setIsDrawing(false);
        setStartPoint({ x: 0, y: 0 });
        setEndPoint({ x: 0, y: 0 });
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDrawing]);

  const getCurrentRectangle = () => {
    if (!isDrawing) return null;

    const x = Math.min(startPoint.x, endPoint.x);
    const y = Math.min(startPoint.y, endPoint.y);
    const width = Math.abs(endPoint.x - startPoint.x);
    const height = Math.abs(endPoint.y - startPoint.y);

    return { x, y, width, height };
  };

  const currentRect = getCurrentRectangle();

  return (
    <div
      ref={overlayRef}
      className={`drag-rectangle-overlay ${isEnabled ? 'enabled' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {currentRect && (
        <div
          className="drawing-rectangle"
          style={{
            left: `${currentRect.x}px`,
            top: `${currentRect.y}px`,
            width: `${currentRect.width}px`,
            height: `${currentRect.height}px`,
          }}
        >
          <div className="coordinates-tooltip">
            {`(${Math.round(currentRect.x)}, ${Math.round(currentRect.y)}) - (${Math.round(currentRect.x + currentRect.width)}, ${Math.round(currentRect.y + currentRect.height)})`}
          </div>
        </div>
      )}
      
      {rectangles.map((rect) => (
        <div
          key={rect.id}
          className="drawn-rectangle"
          style={{
            left: `${rect.startX}px`,
            top: `${rect.startY}px`,
            width: `${rect.endX - rect.startX}px`,
            height: `${rect.endY - rect.startY}px`,
          }}
        >
          <div className="rectangle-info">
            <span className="rectangle-coords">
              {`(${Math.round(rect.startX)}, ${Math.round(rect.startY)})`}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DragRectangle;