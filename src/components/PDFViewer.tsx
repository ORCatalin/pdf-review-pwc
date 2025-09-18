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
import { getPdfPageDimensions, scaleRectangleCoordinates, calculateModalPosition } from '../utils/rectangleUtils';

import 'react-pdf-highlighter/dist/style.css';

interface PDFViewerProps {
  pdfUrl: string;
  highlights: IHighlight[];
  selectedHighlight?: IHighlight;
  onAddHighlight: (highlight: IHighlight) => void;
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
  private resizeObserver: ResizeObserver | null = null;

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

  handleCommentConfirm = (comment: { text: string }) => {
    const { pendingHighlight, pendingRectangle } = this.state;

    if (pendingHighlight) {
      const newHighlight: IHighlight = {
        id: uuidv4(),
        position: pendingHighlight.position,
        content: pendingHighlight.content,
        comment: { text: comment.text, emoji: comment.emoji || '📝' },
        timestamp: Date.now(),
      };

      this.props.onAddHighlight(newHighlight);
      pendingHighlight.hideTipAndSelection();
      pendingHighlight.transformSelection();
    } else if (pendingRectangle) {
      const newRectangle: RectangleWithComment = {
        id: uuidv4(),
        ...pendingRectangle,
        comment: { text: comment.text, emoji: comment.emoji || '📝' },
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
    console.log('handleRequestRectangleComment called with:', rectangle);
    const container = this.containerRef.current;
    if (!container) return;

    // Find the page element to get viewport position
    const pageElement = document.querySelector(`.page[data-page-number="${rectangle.pageNumber}"]`);
    if (!pageElement) return;

    const containerRect = container.getBoundingClientRect();
    const pageRect = pageElement.getBoundingClientRect();

    // Get current PDF dimensions for scaling
    const currentDimensions = getPdfPageDimensions(rectangle.pageNumber);
    if (!currentDimensions) return;

    // Use the unified modal positioning logic
    const position = calculateModalPosition(
      rectangle as RectangleWithComment, // Safe cast since we're not using comment field
      containerRect,
      pageRect,
      currentDimensions
    );

    this.setState({
      showCommentPopup: true,
      commentPosition: position,
      pendingRectangle: rectangle,
      pendingHighlight: null,
    });
  };

  updateHighlight = (highlightId: string) => {
    console.log('Update highlight', highlightId);
  };

  renderRectanglesOnPages = () => {
    // Clean up existing rectangle elements
    document.querySelectorAll('.page-rectangle-container').forEach(el => el.remove());

    // Group rectangles by page
    const rectanglesByPage = this.props.rectangles.reduce((acc, rect) => {
      if (!acc[rect.pageNumber]) {
        acc[rect.pageNumber] = [];
      }
      acc[rect.pageNumber].push(rect);
      return acc;
    }, {} as Record<number, RectangleWithComment[]>);

    // Render rectangles on each page
    Object.entries(rectanglesByPage).forEach(([pageNum, rects]) => {
      const pageElement = document.querySelector(`.page[data-page-number="${pageNum}"]`);
      if (!pageElement) return;

      // Create container for rectangles on this page
      const container = document.createElement('div');
      container.className = 'page-rectangle-container';
      container.style.position = 'absolute';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '10';

      // Get current PDF dimensions for this page
      const currentDimensions = getPdfPageDimensions(parseInt(pageNum));
      if (!currentDimensions) return;

      rects.forEach(rect => {
        // Calculate scaled coordinates based on current PDF size
        const scaledCoords = scaleRectangleCoordinates(rect, currentDimensions);

        const rectElement = document.createElement('div');
        rectElement.className = 'persistent-rectangle';
        rectElement.style.position = 'absolute';
        rectElement.style.left = `${scaledCoords.startX}px`;
        rectElement.style.top = `${scaledCoords.startY}px`;
        rectElement.style.width = `${scaledCoords.endX - scaledCoords.startX}px`;
        rectElement.style.height = `${scaledCoords.endY - scaledCoords.startY}px`;
        rectElement.style.border = '2px solid #ff6b6b';
        rectElement.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
        rectElement.style.pointerEvents = 'all';
        rectElement.style.cursor = 'pointer';

        // Add click handler for editing rectangles
        rectElement.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          // Show edit popup for this rectangle using unified modal positioning logic
          const container = this.containerRef.current;
          if (!container) return;

          const currentPageElement = document.querySelector(`.page[data-page-number="${rect.pageNumber}"]`);
          if (!currentPageElement) return;

          const containerRect = container.getBoundingClientRect();
          const pageRect = currentPageElement.getBoundingClientRect();

          // Use the unified modal positioning logic
          const position = calculateModalPosition(
            rect,
            containerRect,
            pageRect,
            currentDimensions
          );

          this.setState({
            showCommentPopup: true,
            commentPosition: position,
            pendingRectangle: null,
            pendingHighlight: null,
          });
        });

        // Add info label
        const infoLabel = document.createElement('div');
        infoLabel.className = 'rectangle-info';
        infoLabel.style.position = 'absolute';
        infoLabel.style.top = '-25px';
        infoLabel.style.left = '0px';
        infoLabel.style.fontSize = '12px';
        infoLabel.style.color = '#ff6b6b';
        infoLabel.style.backgroundColor = 'white';
        infoLabel.style.padding = '2px 6px';
        infoLabel.style.borderRadius = '3px';
        infoLabel.style.border = '1px solid #ff6b6b';
        infoLabel.style.whiteSpace = 'nowrap';
        infoLabel.textContent = `${rect.comment?.text || 'Rectangle'} (${Math.round(scaledCoords.startX)}, ${Math.round(scaledCoords.startY)})`;

        rectElement.appendChild(infoLabel);
        container.appendChild(rectElement);
      });

      (pageElement as HTMLElement).style.position = 'relative';
      pageElement.appendChild(container);
    });
  };

  // Debounced rectangle rendering to handle multiple rapid changes
  private renderRectanglesDebounced = (() => {
    let timeoutId: number;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => this.renderRectanglesOnPages(), 100);
    };
  })();

  componentDidUpdate(prevProps: PDFViewerProps, prevState: PDFViewerState) {
    // Re-render rectangles when they change
    if (prevProps.rectangles !== this.props.rectangles) {
      this.renderRectanglesDebounced();
    }

    // Re-render rectangles when mode changes (to handle visibility issues)
    if (prevProps.currentMode !== this.props.currentMode) {
      this.renderRectanglesDebounced();
    }

    // Re-render rectangles when comment popup state changes (to handle mode switching)
    if (prevState.showCommentPopup !== this.state.showCommentPopup) {
      this.renderRectanglesDebounced();
    }
  }

  componentDidMount() {
    // Initial render of rectangles after PDF loads
    setTimeout(() => this.renderRectanglesOnPages(), 1000);

    // Also render after a longer delay to handle slow PDF loading
    setTimeout(() => this.renderRectanglesOnPages(), 2000);

    // Set up ResizeObserver to handle container size changes (like splitter resizing)
    if (this.containerRef.current) {
      this.resizeObserver = new ResizeObserver(() => {
        // Debounce the rectangle re-rendering for performance
        this.renderRectanglesDebounced();
      });

      this.resizeObserver.observe(this.containerRef.current);
    }
  }

  componentWillUnmount() {
    // Clean up ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }


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

                  // Render rectangles on their respective pages (debounced for performance)
                  this.renderRectanglesDebounced();
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
                  comment: h.comment ? { ...h.comment, emoji: h.comment.emoji || '📝' } : { text: '', emoji: '📝' }
                }))}
              />
            )}
          </PdfLoader>

          {isRectangleMode && !showCommentPopup && (
            <DragRectangle
              pageNumber={currentPageNumber}
              onRectangleDrawn={onRectangleDrawn}
              isEnabled={isRectangleMode && !showCommentPopup}
              onRequestComment={this.handleRequestRectangleComment}
            />
          )}

          {/* Display all drawn rectangles - removed from here, will be rendered per page */}
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