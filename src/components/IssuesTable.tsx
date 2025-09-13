import React from 'react';
import type { Issue } from '../types/index';

interface IssuesTableProps {
  issues: Issue[];
  selectedIssue: Issue | null;
  onIssueClick: (issue: Issue) => void;
  onUpdateStatus: (issueId: string, status: Issue['status']) => void;
}

const IssuesTable: React.FC<IssuesTableProps> = ({
  issues,
  selectedIssue,
  onIssueClick,
  onUpdateStatus,
}) => {
  const getPriorityColor = (priority: Issue['priority']) => {
    switch (priority) {
      case 'high':
        return '#ff4444';
      case 'medium':
        return '#ffaa00';
      case 'low':
        return '#44aa44';
      default:
        return '#666666';
    }
  };

  const getStatusBadgeClass = (status: Issue['status']) => {
    switch (status) {
      case 'open':
        return 'status-open';
      case 'in-review':
        return 'status-in-review';
      case 'resolved':
        return 'status-resolved';
      default:
        return '';
    }
  };

  return (
    <div className="issues-table-container">
      <div className="issues-table-header">
        <h2>Issues ({issues.length})</h2>
      </div>
      
      <div className="issues-table-wrapper">
        <table className="issues-table">
          <thead>
            <tr>
              <th width="80">ID</th>
              <th width="50">Page</th>
              <th>Description</th>
              <th width="100">Category</th>
              <th width="80">Priority</th>
              <th width="100">Status</th>
              <th width="80">Actions</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr
                key={issue.id}
                className={`issue-row ${selectedIssue?.id === issue.id ? 'selected' : ''}`}
                onClick={() => onIssueClick(issue)}
              >
                <td className="issue-id">{issue.id}</td>
                <td className="issue-page">{issue.page}</td>
                <td className="issue-description">
                  <div className="description-text">
                    {issue.description}
                    {issue.highlight && (
                      <span className="has-highlight" title="Has highlighted text">
                        📌
                      </span>
                    )}
                  </div>
                </td>
                <td className="issue-category">
                  <span className="category-badge">{issue.category}</span>
                </td>
                <td className="issue-priority">
                  <span
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(issue.priority) }}
                  >
                    {issue.priority}
                  </span>
                </td>
                <td className="issue-status">
                  <select
                    className={`status-select ${getStatusBadgeClass(issue.status)}`}
                    value={issue.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      onUpdateStatus(issue.id, e.target.value as Issue['status']);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="open">Open</option>
                    <option value="in-review">In Review</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </td>
                <td className="issue-actions">
                  <button
                    className="action-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onIssueClick(issue);
                    }}
                    title="Go to issue"
                  >
                    →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {issues.length === 0 && (
        <div className="no-issues">
          <p>No issues found</p>
        </div>
      )}
    </div>
  );
};

export default IssuesTable;