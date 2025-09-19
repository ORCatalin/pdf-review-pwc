import { Component, createRef } from 'react';
import {
  PdfLoader,
  PdfHighlighter,
} from 'react-pdf-highlighter';
import type { Issue } from '../types/index';
import { getPdfPageDimensions, scaleRectangleCoordinates } from '../utils/rectangleUtils';

import 'react-pdf-highlighter/dist/style.css';

interface MarkerPDFViewerProps {
  pdfUrl: string;
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
}

interface MarkerPDFViewerState {
  currentPageNumber: number;
}

class MarkerPDFViewer extends Component<MarkerPDFViewerProps, MarkerPDFViewerState> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private highlighterRef = createRef<any>();
  private containerRef = createRef<HTMLDivElement>();
  private resizeObserver: ResizeObserver | null = null;

  state: MarkerPDFViewerState = {
    currentPageNumber: 1,
  };

  calculateMarkerPosition = (issue: Issue) => {
    if (issue.highlight) {
      // Position marker at the center of the highlight
      const position = issue.highlight.position;
      const boundingRect = position.boundingRect;

      const pageElement = this.containerRef.current?.querySelector(`.page[data-page-number="${position.pageNumber}"]`);
      if (!pageElement) return null;

      // Calculate the center position of the highlight
      const centerX = (boundingRect.x1 + boundingRect.x2) / 2;
      const centerY = (boundingRect.y1 + boundingRect.y2) / 2;

      return {
        x: centerX,
        y: centerY,
      };
    } else if (issue.rectangle) {
      // Position marker at the center of the rectangle
      const rectangle = issue.rectangle;
      const currentDimensions = getPdfPageDimensions(rectangle.pageNumber);
      if (!currentDimensions) return null;

      const scaledCoords = scaleRectangleCoordinates(rectangle, currentDimensions);

      // Calculate the center position of the rectangle
      const centerX = (scaledCoords.startX + scaledCoords.endX) / 2;
      const centerY = (scaledCoords.startY + scaledCoords.endY) / 2;

      return {
        x: centerX,
        y: centerY,
      };
    }

    return null;
  };

  renderMarkersOnPages = () => {
    // Clean up existing marker elements (scoped to this marker viewer)
    if (this.containerRef.current) {
      this.containerRef.current.querySelectorAll('.page-marker-container').forEach(el => el.remove());
    }

    // Group issues by page
    const issuesByPage = this.props.issues.reduce((acc, issue) => {
      const pageNumber = issue.page;
      if (!acc[pageNumber]) {
        acc[pageNumber] = [];
      }
      acc[pageNumber].push(issue);
      return acc;
    }, {} as Record<number, Issue[]>);

    // Render markers on each page
    Object.entries(issuesByPage).forEach(([pageNum, pageIssues]) => {
      // Scope page element search to this marker viewer container
      const pageElement = this.containerRef.current?.querySelector(`.page[data-page-number="${pageNum}"]`);
      if (!pageElement) return;

      // Create container for markers on this page
      const container = document.createElement('div');
      container.className = 'page-marker-container';
      container.style.position = 'absolute';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '20';

      pageIssues.forEach(issue => {
        const markerPosition = this.calculateMarkerPosition(issue);
        if (!markerPosition) return;

        const markerElement = document.createElement('div');
        markerElement.className = 'issue-marker';
        markerElement.style.position = 'absolute';
        markerElement.style.left = `${markerPosition.x}px`;
        markerElement.style.top = `${markerPosition.y}px`;
        markerElement.style.transform = 'translate(-50%, -50%)';
        markerElement.style.pointerEvents = 'all';
        markerElement.style.cursor = 'pointer';
        markerElement.style.zIndex = '25';

        const isApproved = issue.status === 'approved';

        // Create the marker icon
        markerElement.innerHTML = `
          <div class="marker-wrapper" title="${issue.id}: ${issue.description}">
            <svg width="24" height="24" viewBox="0 0 24 24" class="marker-icon ${isApproved ? 'approved' : 'not-approved'}">
              <circle cx="12" cy="12" r="11" fill="${isApproved ? '#22c55e' : '#ef4444'}" stroke="${isApproved ? '#16a34a' : '#dc2626'}" stroke-width="1"/>
              ${isApproved
                ? '<path d="M9 12l2 2 4-4" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
                : '<circle cx="12" cy="12" r="4" fill="white"/>'
              }
            </svg>
            <div class="marker-label">${issue.id}</div>
          </div>
        `;

        // Add click handler
        markerElement.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.props.onIssueClick(issue);
        });

        container.appendChild(markerElement);
      });

      (pageElement as HTMLElement).style.position = 'relative';
      pageElement.appendChild(container);
    });
  };

  // Debounced marker rendering to handle multiple rapid changes
  private renderMarkersDebounced = (() => {
    let timeoutId: number;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => this.renderMarkersOnPages(), 100);
    };
  })();

  componentDidUpdate(prevProps: MarkerPDFViewerProps) {
    // Re-render markers when issues change
    if (prevProps.issues !== this.props.issues) {
      this.renderMarkersDebounced();
    }
  }

  componentDidMount() {
    // Initial render of markers after PDF loads
    setTimeout(() => this.renderMarkersOnPages(), 1000);
    setTimeout(() => this.renderMarkersOnPages(), 2000);

    // Set up ResizeObserver to handle container size changes
    if (this.containerRef.current) {
      this.resizeObserver = new ResizeObserver(() => {
        this.renderMarkersDebounced();
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
    const { pdfUrl } = this.props;
    const { currentPageNumber } = this.state;

    return (
      <div className="marker-pdf-viewer-container marker-pdf-viewer" ref={this.containerRef}>
        <div className="marker-pdf-viewer-toolbar">
          <span className="toolbar-info">PDF View - Click markers to navigate to issues in main viewer</span>
          <span className="page-info">Page {currentPageNumber}</span>
        </div>

        <div className="marker-pdf-content">
          <PdfLoader url={pdfUrl} beforeLoad={<div className="pdf-loading">Loading PDF...</div>}>
            {(pdfDocument) => (
              <PdfHighlighter
                ref={this.highlighterRef}
                pdfDocument={pdfDocument}
                enableAreaSelection={() => false}
                onSelectionFinished={() => {}}
                scrollRef={() => {}}
                onScrollChange={() => {
                  // Scope pages query to this marker viewer container
                  const pages = this.containerRef.current?.querySelectorAll('.page') || [];
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

                  // Re-render markers on scroll (debounced for performance)
                  this.renderMarkersDebounced();
                }}
                highlightTransform={() => null}
                highlights={[]}
              />
            )}
          </PdfLoader>
        </div>
      </div>
    );
  }
}

export default MarkerPDFViewer;