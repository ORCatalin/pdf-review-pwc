import React from 'react';
import type { Issue } from '../types/index';

interface IssueMarkerProps {
  issue: Issue;
  position: { x: number; y: number };
  onClick: (issue: Issue) => void;
}

const CheckmarkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <circle cx="12" cy="12" r="11" fill="#22c55e" stroke="#16a34a" strokeWidth="1"/>
    <path
      d="M9 12l2 2 4-4"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const CircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <circle
      cx="12"
      cy="12"
      r="11"
      fill="#ef4444"
      stroke="#dc2626"
      strokeWidth="1"
    />
    <circle
      cx="12"
      cy="12"
      r="4"
      fill="white"
    />
  </svg>
);

const IssueMarker: React.FC<IssueMarkerProps> = ({
  issue,
  position,
  onClick,
}) => {
  const isApproved = issue.status === 'approved';

  return (
    <div
      className="issue-marker"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        zIndex: 10,
      }}
      onClick={() => onClick(issue)}
      title={`${issue.id}: ${issue.description}`}
    >
      {isApproved ? (
        <CheckmarkIcon className="marker-icon approved" />
      ) : (
        <CircleIcon className="marker-icon not-approved" />
      )}
      <div className="marker-label">
        {issue.id}
      </div>
    </div>
  );
};

export default IssueMarker;