import React, { useState, useRef, useCallback } from 'react';
import IssuesTable from './IssuesTable';
import PDFViewer from './PDFViewer';
import ResizableSplitter from './ResizableSplitter';
import type { Issue, IHighlight, RectangleWithComment } from '../types/index';
import { InteractionMode } from '../types/index';
import { mockIssues, mockHighlights } from '../data/mockData';
import { v4 as uuidv4 } from 'uuid';
import '../styles/PDFReview.css';

const PDFReviewApp: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>(mockIssues);
  const [highlights, setHighlights] = useState<IHighlight[]>(mockHighlights);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [rectangles, setRectangles] = useState<RectangleWithComment[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string>('/sample.pdf');
  const [currentMode, setCurrentMode] = useState<InteractionMode>(InteractionMode.HIGHLIGHT);
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
      status: 'open',
      priority: 'medium',
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
    
    setIssues(prev =>
      prev.map(issue => {
        if (issue.highlight?.id === highlightId) {
          return { ...issue, highlight: undefined };
        }
        return issue;
      })
    );
  }, []);

  const handleRectangleDrawn = useCallback((rectangle: RectangleWithComment) => {
    setRectangles(prev => [...prev, rectangle]);
    console.log('Rectangle coordinates:', {
      startX: rectangle.startX,
      startY: rectangle.startY,
      endX: rectangle.endX,
      endY: rectangle.endY,
      pageNumber: rectangle.pageNumber,
      comment: rectangle.comment,
    });
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setHighlights([]);
      setIssues(mockIssues.map(issue => ({ ...issue, highlight: undefined })));
      setSelectedIssue(null);
      setRectangles([]);
    }
  }, []);

  const handleUpdateIssueStatus = useCallback((issueId: string, status: Issue['status']) => {
    setIssues(prev =>
      prev.map(issue =>
        issue.id === issueId ? { ...issue, status } : issue
      )
    );
  }, []);

  return (
    <div className="pdf-review-app">
      <div className="pdf-review-header">
        <h1>PDF Review Tool</h1>
        
        <div className="mode-selector">
          <button
            className={`mode-button ${currentMode === InteractionMode.HIGHLIGHT ? 'active' : ''}`}
            onClick={() => setCurrentMode(InteractionMode.HIGHLIGHT)}
            title="Highlight Text Mode"
          >
            🖍️ Highlight
          </button>
          <button
            className={`mode-button ${currentMode === InteractionMode.RECTANGLE ? 'active' : ''}`}
            onClick={() => setCurrentMode(InteractionMode.RECTANGLE)}
            title="Draw Rectangle Mode"
          >
            📐 Rectangle
          </button>
          <button
            className={`mode-button ${currentMode === InteractionMode.VIEW_ONLY ? 'active' : ''}`}
            onClick={() => setCurrentMode(InteractionMode.VIEW_ONLY)}
            title="View Only Mode"
          >
            👁️ View Only
          </button>
        </div>

        <div className="header-controls">
          <label htmlFor="pdf-upload" className="upload-button">
            Upload PDF
            <input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
          <div className="stats">
            <span className="stat">
              Open: {issues.filter(i => i.status === 'open').length}
            </span>
            <span className="stat">
              In Review: {issues.filter(i => i.status === 'in-review').length}
            </span>
            <span className="stat">
              Resolved: {issues.filter(i => i.status === 'resolved').length}
            </span>
          </div>
        </div>
      </div>
      
      <div className="pdf-review-content">
        <ResizableSplitter
          leftPanel={
            <IssuesTable
              issues={issues}
              selectedIssue={selectedIssue}
              onIssueClick={handleIssueClick}
              onUpdateStatus={handleUpdateIssueStatus}
            />
          }
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
              currentMode={currentMode}
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