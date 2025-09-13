import { Component, createRef } from 'react';
import {
  PdfLoader,
  PdfHighlighter,
  Highlight,
  Popup,
  AreaHighlight,
} from 'react-pdf-highlighter';
import type { IHighlight, RectangleWithComment, ScaledPosition, Content } from '../types/index';
import { InteractionMode } from '../types/index';
import CommentPopup from './CommentPopup';
import DragRectangle from './DragRectangle';
import { v4 as uuidv4 } from 'uuid';

import 'react-pdf-highlighter/dist/style.css';

interface PDFViewerProps {
  pdfUrl: string;
  highlights: IHighlight[];
  selectedHighlight?: IHighlight;
  onAddHighlight: (highlight: IHighlight, priority?: 'low' | 'medium' | 'high') => void;
  onUpdateHighlight: (highlightId: string, update: Partial<IHighlight>) => void;
  onDeleteHighlight: (highlightId: string) => void;
  onRectangleDrawn: (rectangle: RectangleWithComment) => void;
  rectangles: RectangleWithComment[];
  currentMode: InteractionMode;
}

interface PendingHighlight {
  position: ScaledPosition;
  content: Content;
  hideTipAndSelection: () => void;
  transformSelection: () => void;
}

interface PDFViewerState {
  showCommentPopup: boolean;
  commentPosition: { x: number; y: number };
  pendingHighlight: PendingHighlight | null;
  currentPageNumber: number;
  pendingRectangle: Omit<RectangleWithComment, 'id' | 'comment'> | null;
  temporaryHighlight: IHighlight | null;
}

class PDFViewer extends Component<PDFViewerProps, PDFViewerState> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private highlighterRef = createRef<any>();
  private containerRef = createRef<HTMLDivElement>();

  state: PDFViewerState = {
    showCommentPopup: false,
    commentPosition: { x: 0, y: 0 },
    pendingHighlight: null,
    currentPageNumber: 1,
    pendingRectangle: null,
    temporaryHighlight: null,
  };

  scrollToHighlight = (highlight: IHighlight) => {
    if (this.highlighterRef.current) {
      this.highlighterRef.current.scrollTo(highlight);
    }
  };

  scrollToPage = (pageNumber: number) => {
    const pageElement = document.querySelector(`.page[data-page-number="${pageNumber}"]`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  handleTextSelection = (
    position: ScaledPosition,
    content: Content,
    hideTipAndSelection: () => void,
    transformSelection: () => void
  ) => {
    // Only allow text highlighting in HIGHLIGHT mode
    if (this.props.currentMode !== InteractionMode.HIGHLIGHT) {
      hideTipAndSelection();
      return;
    }

    const viewportPosition = this.getViewportPosition(position);
    
    // Create a temporary highlight to show the selected text
    const temporaryHighlight: IHighlight = {
      id: 'temp-highlight',
      position,
      content,
      comment: { text: 'Temporary selection', emoji: '' },
      timestamp: Date.now(),
    };
    
    this.setState({
      showCommentPopup: true,
      commentPosition: viewportPosition,
      pendingHighlight: {
        position,
        content,
        hideTipAndSelection,
        transformSelection,
      },
      temporaryHighlight,
    });
  };

  getViewportPosition = (position: ScaledPosition) => {
    const container = this.containerRef.current;
    if (!container) return { x: 100, y: 100 };

    const rect = container.getBoundingClientRect();
    const pageElement = document.querySelector(`.page[data-page-number="${position.pageNumber}"]`);
    
    if (!pageElement) return { x: 100, y: 100 };

    const pageRect = pageElement.getBoundingClientRect();
    const boundingRect = position.boundingRect;

    // Calculate the center X position of the selection
    const selectionCenterX = pageRect.left - rect.left + (boundingRect.x1 + boundingRect.x2) / 2;
    
    // Position modal to the right of selection, or centered if selection is wide
    const modalWidth = 300; // Approximate modal width
    let x = pageRect.left - rect.left + boundingRect.x2 + 20; // 20px offset to the right
    
    // If modal would go off-screen to the right, position it to the left of selection
    if (x + modalWidth > rect.width) {
      x = pageRect.left - rect.left + boundingRect.x1 - modalWidth - 20;
    }
    
    // If still off-screen, center it horizontally
    if (x < 0) {
      x = Math.max(10, Math.min(selectionCenterX - modalWidth / 2, rect.width - modalWidth - 10));
    }
    
    // Position modal below the selection with some offset
    const y = pageRect.top - rect.top + boundingRect.y2 + 10;
    
    // If modal would be too low, position it above the selection
    const modalHeight = 300; // Approximate modal height
    const adjustedY = y + modalHeight > rect.height 
      ? Math.max(10, pageRect.top - rect.top + boundingRect.y1 - modalHeight - 10)
      : y;

    return {
      x: Math.max(10, Math.min(x, rect.width - modalWidth - 10)),
      y: adjustedY,
    };
  };

  handleCommentConfirm = (comment: { text: string; emoji?: string; priority?: 'low' | 'medium' | 'high' }) => {
    const { pendingHighlight, pendingRectangle } = this.state;

    if (pendingHighlight) {
      const newHighlight: IHighlight = {
        id: uuidv4(),
        position: pendingHighlight.position,
        content: pendingHighlight.content,
        comment: { text: comment.text, emoji: comment.emoji },
        timestamp: Date.now(),
      };

      this.props.onAddHighlight(newHighlight, comment.priority);
      pendingHighlight.hideTipAndSelection();
      pendingHighlight.transformSelection();
    } else if (pendingRectangle) {
      const newRectangle: RectangleWithComment = {
        id: uuidv4(),
        ...pendingRectangle,
        comment: { text: comment.text, emoji: comment.emoji },
      };

      this.props.onRectangleDrawn(newRectangle);
    }

    this.setState({
      showCommentPopup: false,
      pendingHighlight: null,
      pendingRectangle: null,
      temporaryHighlight: null,
    });
  };

  handleCommentCancel = () => {
    const { pendingHighlight } = this.state;
    
    if (pendingHighlight) {
      pendingHighlight.hideTipAndSelection();
    }

    this.setState({
      showCommentPopup: false,
      pendingHighlight: null,
      pendingRectangle: null,
      temporaryHighlight: null,
    });
  };

  handleRequestRectangleComment = (rectangle: Omit<RectangleWithComment, 'id' | 'comment'>) => {
    const container = this.containerRef.current;
    const modalWidth = 300;
    const modalHeight = 300;
    
    // Position modal to the right of the rectangle
    let x = rectangle.endX + 20;
    
    // If modal would go off-screen to the right, position it to the left
    if (container && x + modalWidth > container.offsetWidth) {
      x = rectangle.startX - modalWidth - 20;
    }
    
    // If still off-screen, center it horizontally
    if (x < 0) {
      x = Math.max(10, (rectangle.startX + rectangle.endX) / 2 - modalWidth / 2);
    }
    
    // Position modal below the rectangle
    let y = rectangle.endY + 10;
    
    // If modal would be too low, position it above
    if (container && y + modalHeight > container.offsetHeight) {
      y = Math.max(10, rectangle.startY - modalHeight - 10);
    }
    
    this.setState({
      showCommentPopup: true,
      commentPosition: { x, y },
      pendingRectangle: rectangle,
      pendingHighlight: null,
    });
  };

  updateHighlight = (highlightId: string) => {
    console.log('Update highlight', highlightId);
  };


  render() {
    const { pdfUrl, highlights, selectedHighlight, onRectangleDrawn, currentMode } = this.props;
    const { showCommentPopup, commentPosition, currentPageNumber, temporaryHighlight } = this.state;

    const isRectangleMode = currentMode === InteractionMode.RECTANGLE;
    
    // Combine regular highlights with temporary highlight
    const allHighlights = temporaryHighlight ? [...highlights, temporaryHighlight] : highlights;

    return (
      <div className="pdf-viewer-container" ref={this.containerRef}>
        <div className="pdf-viewer-toolbar">
          <span className="toolbar-info">
            {currentMode === InteractionMode.HIGHLIGHT && 'Select text to add highlights'}
            {currentMode === InteractionMode.RECTANGLE && 'Click and drag to draw rectangles'}
            {currentMode === InteractionMode.VIEW_ONLY && 'View-only mode: You can scroll and select text but not create highlights or rectangles'}
          </span>
          <span className="page-info">Page {currentPageNumber}</span>
        </div>

        <div className="pdf-content">
          <PdfLoader url={pdfUrl} beforeLoad={<div className="pdf-loading">Loading PDF...</div>}>
            {(pdfDocument) => (
              <PdfHighlighter
                ref={this.highlighterRef}
                pdfDocument={pdfDocument}
                enableAreaSelection={() => currentMode === InteractionMode.RECTANGLE}
                onSelectionFinished={this.handleTextSelection}
                scrollRef={() => {}}
                onScrollChange={() => {
                  const pages = document.querySelectorAll('.page');
                  let currentPage = 1;
                  pages.forEach((page) => {
                    const rect = page.getBoundingClientRect();
                    if (rect.top <= 100 && rect.bottom > 100) {
                      currentPage = parseInt(page.getAttribute('data-page-number') || '1');
                    }
                  });
                  if (currentPage !== this.state.currentPageNumber) {
                    this.setState({ currentPageNumber: currentPage });
                  }
                }}
                highlightTransform={(
                  highlight,
                  index,
                  setTip,
                  hideTip,
                  _viewportToScaled,
                  _screenshot,
                  isScrolledTo
                ) => {
                  const isTextHighlight = !highlight.content?.image;
                  const isTemporary = highlight.id === 'temp-highlight';

                  // For temporary highlights, use special styling and no popup
                  if (isTemporary) {
                    return (
                      <Highlight
                        isScrolledTo={false}
                        position={highlight.position}
                        comment={highlight.comment}
                        key={index}
                      />
                    );
                  }

                  const component = isTextHighlight ? (
                    <Highlight
                      isScrolledTo={isScrolledTo || highlight.id === selectedHighlight?.id}
                      position={highlight.position}
                      comment={highlight.comment}
                    />
                  ) : (
                    <AreaHighlight
                      isScrolledTo={isScrolledTo || highlight.id === selectedHighlight?.id}
                      highlight={highlight}
                      onChange={() => {
                        this.updateHighlight(highlight.id);
                      }}
                    />
                  );

                  return (
                    <Popup
                      popupContent={
                        <div className="highlight-popup">
                          {highlight.comment?.emoji && (
                            <span className="comment-emoji">{highlight.comment.emoji}</span>
                          )}
                          <div className="comment-text">{highlight.comment?.text}</div>
                          {highlight.content?.text && (
                            <div className="highlight-text">"{highlight.content?.text}"</div>
                          )}
                          <button
                            className="delete-highlight"
                            onClick={() => this.props.onDeleteHighlight(highlight.id)}
                          >
                            Delete
                          </button>
                        </div>
                      }
                      onMouseOver={(popupContent) => setTip(highlight, () => popupContent)}
                      onMouseOut={hideTip}
                      key={index}
                    >
                      {component}
                    </Popup>
                  );
                }}
                highlights={allHighlights.map(h => ({
                  ...h,
                  comment: h.comment || { text: '', emoji: '' }
                }))}
              />
            )}
          </PdfLoader>

          {isRectangleMode && (
            <DragRectangle
              pageNumber={currentPageNumber}
              onRectangleDrawn={onRectangleDrawn}
              isEnabled={isRectangleMode}
              onRequestComment={this.handleRequestRectangleComment}
            />
          )}
        </div>

        {showCommentPopup && (
          <CommentPopup
            position={commentPosition}
            onConfirm={this.handleCommentConfirm}
            onCancel={this.handleCommentCancel}
          />
        )}
      </div>
    );
  }
}

export default PDFViewer;