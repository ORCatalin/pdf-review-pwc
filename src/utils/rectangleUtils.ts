import type { RectangleWithComment } from '../types/index';

export interface PdfDimensions {
  width: number;
  height: number;
}

export interface ScaledCoordinates {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface ModalPosition {
  x: number;
  y: number;
}

/**
 * Get current PDF page dimensions
 */
export const getPdfPageDimensions = (pageNumber: number): PdfDimensions | null => {
  const pageElement = document.querySelector(`.page[data-page-number="${pageNumber}"]`);
  if (!pageElement) return null;

  const rect = pageElement.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height
  };
};

/**
 * Calculate scale factors between original and current PDF dimensions
 */
export const calculateScaleFactors = (
  rectangle: RectangleWithComment,
  currentDimensions: PdfDimensions
): { scaleX: number; scaleY: number } => {
  const originalWidth = rectangle.originalPdfWidth || currentDimensions.width;
  const originalHeight = rectangle.originalPdfHeight || currentDimensions.height;

  return {
    scaleX: currentDimensions.width / originalWidth,
    scaleY: currentDimensions.height / originalHeight
  };
};

/**
 * Scale rectangle coordinates based on current PDF size
 */
export const scaleRectangleCoordinates = (
  rectangle: RectangleWithComment,
  currentDimensions: PdfDimensions
): ScaledCoordinates => {
  const { scaleX, scaleY } = calculateScaleFactors(rectangle, currentDimensions);

  return {
    startX: rectangle.startX * scaleX,
    startY: rectangle.startY * scaleY,
    endX: rectangle.endX * scaleX,
    endY: rectangle.endY * scaleY
  };
};

/**
 * Calculate optimal modal position that stays within viewport bounds
 */
export const calculateModalPosition = (
  rectangle: RectangleWithComment,
  containerRect: DOMRect,
  pageRect: DOMRect,
  currentDimensions: PdfDimensions,
  modalWidth: number = 300,
  modalHeight: number = 300
): ModalPosition => {
  // Get scaled coordinates
  const scaledCoords = scaleRectangleCoordinates(rectangle, currentDimensions);

  // Calculate rectangle center for better positioning
  const rectCenterX = pageRect.left - containerRect.left + (scaledCoords.startX + scaledCoords.endX) / 2;
  const rectViewportX = pageRect.left - containerRect.left + scaledCoords.endX;
  const rectViewportY = pageRect.top - containerRect.top + scaledCoords.endY;

  // Position modal to the right of the rectangle
  let x = rectViewportX + 20;

  // If modal would go off-screen to the right, position it to the left
  if (x + modalWidth > containerRect.width) {
    x = pageRect.left - containerRect.left + scaledCoords.startX - modalWidth - 20;
  }

  // If still off-screen, center it on the rectangle's center, ensuring it stays in viewport
  if (x < 0) {
    x = Math.max(10, Math.min(rectCenterX - modalWidth / 2, containerRect.width - modalWidth - 10));
  }

  // Ensure modal never goes off-screen to the right
  if (x + modalWidth > containerRect.width) {
    x = containerRect.width - modalWidth - 10;
  }

  // Position modal below the rectangle
  let y = rectViewportY + 10;

  // If modal would be too low, position it above
  if (y + modalHeight > containerRect.height) {
    y = Math.max(10, pageRect.top - containerRect.top + scaledCoords.startY - modalHeight - 10);
  }

  return { x, y };
};

/**
 * Check if rectangle coordinates are valid (not too small)
 */
export const isValidRectangleSize = (
  rectangle: Pick<RectangleWithComment, 'startX' | 'startY' | 'endX' | 'endY'>,
  minSize: number = 5
): boolean => {
  const width = Math.abs(rectangle.endX - rectangle.startX);
  const height = Math.abs(rectangle.endY - rectangle.startY);
  return width > minSize && height > minSize;
};

/**
 * Create a rectangle with PDF dimensions captured
 */
export const createRectangleWithDimensions = (
  rectangleData: Omit<RectangleWithComment, 'id' | 'comment' | 'originalPdfWidth' | 'originalPdfHeight'>,
  pdfDimensions: PdfDimensions
): Omit<RectangleWithComment, 'id' | 'comment'> => {
  return {
    ...rectangleData,
    originalPdfWidth: pdfDimensions.width,
    originalPdfHeight: pdfDimensions.height
  };
};