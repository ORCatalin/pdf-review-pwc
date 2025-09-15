import React, { useState, useRef, useEffect } from 'react';
import type { RectangleWithComment } from '../types/index';
import { getPdfPageDimensions, createRectangleWithDimensions, isValidRectangleSize } from '../utils/rectangleUtils';

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
  // onRectangleDrawn, // Currently unused but kept for future use
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [endPoint, setEndPoint] = useState({ x: 0, y: 0 });
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

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing || !isEnabled) return;

    const overlayRect = overlayRef.current?.getBoundingClientRect();
    if (!overlayRect) {
      setIsDrawing(false);
      return;
    }

    // Get current mouse position for accurate endPoint
    const currentX = e.clientX - overlayRect.left;
    const currentY = e.clientY - overlayRect.top;

    // Find which page the rectangle is actually on by checking overlap
    const rectLeft = Math.min(startPoint.x, currentX);
    const rectTop = Math.min(startPoint.y, currentY);
    const rectRight = Math.max(startPoint.x, currentX);
    const rectBottom = Math.max(startPoint.y, currentY);
    const rectCenterX = overlayRect.left + (rectLeft + rectRight) / 2;
    const rectCenterY = overlayRect.top + (rectTop + rectBottom) / 2;

    // Find the page that contains the center of the rectangle
    let targetPageNumber = pageNumber;
    let targetPageElement = null;

    const pages = document.querySelectorAll('.page[data-page-number]');
    for (const page of pages) {
      const pageRect = page.getBoundingClientRect();
      if (rectCenterX >= pageRect.left && rectCenterX <= pageRect.right &&
          rectCenterY >= pageRect.top && rectCenterY <= pageRect.bottom) {
        targetPageNumber = parseInt(page.getAttribute('data-page-number') || '1');
        targetPageElement = page;
        break;
      }
    }

    if (!targetPageElement) {
      // Fallback to the original behavior if page detection fails
      targetPageElement = document.querySelector(`.page[data-page-number="${pageNumber}"]`);
      targetPageNumber = pageNumber;

      if (!targetPageElement) {
        setIsDrawing(false);
        return;
      }
    }

    const pageRect = targetPageElement.getBoundingClientRect();
    const pageOffsetX = pageRect.left - overlayRect.left;
    const pageOffsetY = pageRect.top - overlayRect.top;

    // Get current PDF dimensions for scaling
    const pdfDimensions = getPdfPageDimensions(targetPageNumber);
    if (!pdfDimensions) {
      console.log('Could not get PDF dimensions for page', targetPageNumber);
      setIsDrawing(false);
      return;
    }

    const rectangleData = {
      startX: Math.min(startPoint.x, currentX) - pageOffsetX,
      startY: Math.min(startPoint.y, currentY) - pageOffsetY,
      endX: Math.max(startPoint.x, currentX) - pageOffsetX,
      endY: Math.max(startPoint.y, currentY) - pageOffsetY,
      pageNumber: targetPageNumber,
    };

    // Only create rectangle if it's large enough
    if (isValidRectangleSize(rectangleData)) {
      // Create rectangle with PDF dimensions captured
      const rectangleWithDimensions = createRectangleWithDimensions(rectangleData, pdfDimensions);
      console.log('Requesting comment for rectangle:', rectangleWithDimensions);
      onRequestComment(rectangleWithDimensions);
    } else {
      // Debug log for small rectangles
      const width = Math.abs(rectangleData.endX - rectangleData.startX);
      const height = Math.abs(rectangleData.endY - rectangleData.startY);
      console.log('Rectangle too small:', { width, height, rectangleData });
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
      style={{
        display: isEnabled ? 'block' : 'none'
      }}
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

    </div>
  );
};

export default DragRectangle;