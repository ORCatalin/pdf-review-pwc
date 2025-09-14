export interface BoundingRect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
  pageNumber?: number;
}

export interface ScaledPosition {
  boundingRect: BoundingRect;
  rects: BoundingRect[];
  pageNumber: number;
  usePdfCoordinates?: boolean;
}

export interface Content {
  text?: string;
  image?: string;
}

export interface HighlightContent {
  content: Content;
  position: ScaledPosition;
  comment?: Comment;
}

export interface Comment {
  text: string;
  emoji?: string;
}

export interface IHighlight {
  id: string;
  position: ScaledPosition;
  content: Content;
  comment?: Comment;
  timestamp?: number;
}

export interface Issue {
  id: string;
  page: number;
  description: string;
  highlight?: IHighlight;
  rectangle?: RectangleWithComment;
  status: 'open' | 'resolved' | 'in-review';
  priority: 'low' | 'medium' | 'high';
  category: string;
}

export interface Rectangle {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  pageNumber: number;
}

export interface ViewportHighlight {
  position: ScaledPosition;
}

export interface LTWH {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Scaled {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
}

export const InteractionMode = {
  HIGHLIGHT: 'highlight',
  RECTANGLE: 'rectangle',
  VIEW_ONLY: 'view-only'
} as const;

export type InteractionMode = typeof InteractionMode[keyof typeof InteractionMode];

export interface RectangleWithComment extends Rectangle {
  comment?: Comment;
}