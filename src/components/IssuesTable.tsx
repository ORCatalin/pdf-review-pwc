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

  const getStatusBadgeClass = (status: Issue['status']) => {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'not-approved':
        return 'status-not-approved';
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
              <th style={{ width: '80px' }}>ID</th>
              <th style={{ width: '50px' }}>Page</th>
              <th>Description</th>
              <th style={{ width: '100px' }}>Category</th>
              <th style={{ width: '100px' }}>Status</th>
              <th style={{ width: '80px' }}>Actions</th>
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
                  </div>
                </td>
                <td className="issue-category">
                  <span className="category-badge">{issue.category}</span>
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
                    <option value="not-approved">Not Approved</option>
                    <option value="approved">Approved</option>
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