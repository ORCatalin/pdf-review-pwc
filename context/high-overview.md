# PDF Review Application - High-Level Overview

## Application Purpose
A professional PDF document review and annotation tool designed for collaborative document review workflows, particularly suited for financial audits, compliance reviews, and document quality assurance processes.

## Core Functionalities

### 1. PDF Document Management
- **PDF Loading & Display**: View PDF documents with full navigation support
- **Page Navigation**: Smooth scrolling and page-by-page navigation
- **Real-time Page Tracking**: Current page indicator in the viewer toolbar

### 2. Annotation System

#### Text Highlighting
- Select and highlight text passages within PDFs
- Add contextual comments to highlights
- Persistent highlight storage across sessions
- Visual feedback with highlight hover tooltips
- Delete highlights when no longer needed

#### Rectangle Drawing
- Draw rectangular annotations on PDF pages
- Useful for highlighting areas, diagrams, or non-text content
- Add comments to rectangular selections
- Real-time coordinate display while drawing
- Visual feedback with coordinate tooltips

### 3. Issues Management System

#### Issue Creation & Tracking
- Automatically create issues from highlights and annotations
- Manual issue creation with detailed descriptions
- Issue ID generation (ISSUE-001, ISSUE-002, etc.)
- Link issues directly to PDF page numbers and highlights

#### Issue Properties
- **Status Management**:
  - Not Approved (issues requiring attention)
  - Approved (issues that have been reviewed and approved)

#### Issues Table Features
- Filter by category capabilities
- Click-to-navigate: Jump directly to issue location in PDF
- Real-time status updates with dropdown selectors
- Color-coded status badges

### 4. Interaction Modes
The application supports three distinct interaction modes:

#### Highlight Mode
- Default mode for text selection and highlighting
- Create text annotations with comments
- Full text selection capabilities

#### Rectangle Mode
- Draw rectangular annotations
- Annotate images, charts, or specific areas
- Useful for non-text content review

#### View-Only Mode
- Read-only document viewing
- Prevents accidental modifications
- Ideal for final review or presentation

### 5. User Interface Components

#### Split-Panel Layout
- **Left Panel**: Issues table with filtering and management
- **Right Panel**: PDF viewer with annotation tools
- **Resizable Splitter**: Adjust panel widths to preference
- Minimum width constraints for usability

#### Header Dashboard
- Application title and branding
- Mode selector buttons with visual feedback
- Real-time statistics dashboard:
  - Not Approved issues count
  - Approved issues count

#### Comment Popup System
- Modal dialog for adding comments
- Keyboard shortcuts:
  - Enter: Submit comment
  - Escape: Cancel operation
  - Shift+Enter: New line in comment
- Auto-focus on text area for quick input

### 6. Collaborative Features

#### Comment System
- Text comments linked to specific highlights or rectangles
- Editable comment text
- Visual comment display in hover tooltips

#### Issue Workflow
- Status tracking (Not Approved ⇔ Approved)
- Category classification for organization
- Synchronized updates across all views

### 7. Technical Capabilities

#### Performance Features
- Efficient PDF rendering using react-pdf-highlighter
- Smooth scrolling and navigation
- Responsive UI with immediate feedback
- Optimized for large PDF documents

#### Data Management
- In-memory storage of highlights and issues
- Automatic issue-highlight synchronization
- UUID generation for unique identifiers
- Timestamp tracking for annotations

### 8. Quality Assurance Features

#### Testing Infrastructure
- Comprehensive Playwright test suite
- Unit tests for individual components
- Integration tests for workflows
- Visual regression testing capabilities

#### Development Tools
- Hot Module Replacement (HMR) for rapid development
- TypeScript for type safety
- ESLint for code quality
- Vite for fast builds and development

## Use Cases

### Financial Document Review
- Review financial statements and reports
- Highlight discrepancies or concerns
- Track audit findings with approval status
- Collaborate on compliance issues

### Legal Document Analysis
- Annotate contracts and agreements
- Mark clauses requiring attention
- Track review progress with status updates
- Add detailed comments for clarification

### Quality Assurance Workflows
- Review technical documentation
- Mark errors or inconsistencies
- Track correction status
- Track issue approval status

### Educational Document Review
- Grade and comment on submissions
- Highlight areas for improvement
- Track feedback implementation
- Organize review comments by category