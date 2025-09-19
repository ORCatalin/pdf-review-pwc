import React, { useState, useRef, useCallback } from 'react';
import IssuesTable from './IssuesTable';
import PDFViewer from './PDFViewer';
import MarkerPDFViewer from './MarkerPDFViewer';
import ViewModeSwitch, { type ViewMode } from './ViewModeSwitch';
import ResizableSplitter from './ResizableSplitter';
import type { Issue, IHighlight, RectangleWithComment } from '../types/index';
import { mockHighlights } from '../data/mockData';
import { v4 as uuidv4 } from 'uuid';
import '../styles/PDFReview.css';

const PRIMARY_PDF_URL = './sample.pdf';

const PDFReviewApp: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [highlights, setHighlights] = useState<IHighlight[]>(mockHighlights);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [rectangles, setRectangles] = useState<RectangleWithComment[]>([]);
  const [pdfUrl] = useState<string>(PRIMARY_PDF_URL);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfViewerRef = useRef<any>(null);

  const handleIssueClick = useCallback((issue: Issue) => {
    setSelectedIssue(issue);

    if (issue.highlight && pdfViewerRef.current) {
      pdfViewerRef.current.scrollToHighlight(issue.highlight);
    } else if (pdfViewerRef.current) {
      pdfViewerRef.current.scrollToPage(issue.page);
    }
  }, []);

  const handleAddHighlight = useCallback((highlight: IHighlight) => {
    const newHighlight = {
      ...highlight,
      id: uuidv4(),
      timestamp: Date.now(),
    };

    setHighlights(prev => [...prev, newHighlight]);

    const newIssue: Issue = {
      id: `ISSUE-${String(issues.length + 1).padStart(3, '0')}`,
      page: highlight.position.pageNumber,
      description: highlight.comment?.text || 'New highlight added',
      highlight: newHighlight,
      status: 'not-approved',
      category: 'User Review',
    };

    setIssues(prev => [...prev, newIssue]);
  }, [issues.length]);

  const handleUpdateHighlight = useCallback((highlightId: string, update: Partial<IHighlight>) => {
    setHighlights(prev => 
      prev.map(h => h.id === highlightId ? { ...h, ...update } : h)
    );
    
    setIssues(prev =>
      prev.map(issue => {
        if (issue.highlight?.id === highlightId) {
          return {
            ...issue,
            highlight: { ...issue.highlight, ...update },
            description: update.comment?.text || issue.description,
          };
        }
        return issue;
      })
    );
  }, []);

  const handleDeleteHighlight = useCallback((highlightId: string) => {
    setHighlights(prev => prev.filter(h => h.id !== highlightId));

    // Remove the entire issue if it was created from this highlight
    setIssues(prev => prev.filter(issue => issue.highlight?.id !== highlightId));
  }, []);

  const handleRectangleDrawn = useCallback((rectangle: RectangleWithComment) => {
    setRectangles(prev => [...prev, rectangle]);

    // Create an issue from the rectangle similar to how highlights work
    const newIssue: Issue = {
      id: `RECT-${String(issues.length + 1).padStart(3, '0')}`,
      page: rectangle.pageNumber,
      description: rectangle.comment?.text || 'Rectangle annotation added',
      rectangle: rectangle,
      status: 'not-approved',
      category: 'Rectangle Annotation',
    };

    setIssues(prev => [...prev, newIssue]);

    console.log('Rectangle coordinates:', {
      startX: rectangle.startX,
      startY: rectangle.startY,
      endX: rectangle.endX,
      endY: rectangle.endY,
      pageNumber: rectangle.pageNumber,
      comment: rectangle.comment,
    });
  }, [issues.length]);

  const handleUpdateIssueStatus = useCallback((issueId: string, status: Issue['status']) => {
    setIssues(prev =>
      prev.map(issue =>
        issue.id === issueId ? { ...issue, status } : issue
      )
    );
  }, []);

  const handleMarkerIssueClick = useCallback((issue: Issue) => {
    setSelectedIssue(issue);

    // Navigate to the issue in the main PDF viewer
    if (issue.highlight && pdfViewerRef.current) {
      pdfViewerRef.current.scrollToHighlight(issue.highlight);
    } else if (pdfViewerRef.current) {
      pdfViewerRef.current.scrollToPage(issue.page);
    }
  }, []);

  const renderLeftPanel = () => {
    return (
      <div className="issues-panel">
        <ViewModeSwitch
          currentMode={viewMode}
          onModeChange={setViewMode}
        />
        {viewMode === 'pdf' ? (
          <MarkerPDFViewer
            pdfUrl={pdfUrl}
            issues={issues}
            onIssueClick={handleMarkerIssueClick}
          />
        ) : (
          <IssuesTable
            issues={issues}
            selectedIssue={selectedIssue}
            onIssueClick={handleIssueClick}
            onUpdateStatus={handleUpdateIssueStatus}
          />
        )}
      </div>
    );
  };

  return (
    <div className="pdf-review-app">
      <div className="pdf-review-header">
        <h1>PDF Review Tool</h1>
        

        <div className="header-controls">
          <div className="stats">
            <span className="stat">
              Not Approved: {issues.filter(i => i.status === 'not-approved').length}
            </span>
            <span className="stat">
              Approved: {issues.filter(i => i.status === 'approved').length}
            </span>
          </div>
        </div>
      </div>
      
      <div className="pdf-review-content">
        <ResizableSplitter
          leftPanel={renderLeftPanel()}
          rightPanel={
            <PDFViewer
              ref={pdfViewerRef}
              pdfUrl={pdfUrl}
              highlights={highlights}
              selectedHighlight={selectedIssue?.highlight}
              onAddHighlight={handleAddHighlight}
              onUpdateHighlight={handleUpdateHighlight}
              onDeleteHighlight={handleDeleteHighlight}
              onRectangleDrawn={handleRectangleDrawn}
              rectangles={rectangles}
            />
          }
          initialLeftWidth={35}
          minLeftWidth={300}
          minRightWidth={400}
        />
      </div>
    </div>
  );
};

export default PDFReviewApp;