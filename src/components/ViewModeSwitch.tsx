import React from 'react';

export type ViewMode = 'table' | 'pdf';

interface ViewModeSwitchProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const ViewModeSwitch: React.FC<ViewModeSwitchProps> = ({
  currentMode,
  onModeChange,
}) => {
  return (
    <div className="view-mode-switch">
      <button
        className={`switch-button ${currentMode === 'table' ? 'active' : ''}`}
        onClick={() => onModeChange('table')}
      >
        Table
      </button>
      <button
        className={`switch-button ${currentMode === 'pdf' ? 'active' : ''}`}
        onClick={() => onModeChange('pdf')}
      >
        PDF
      </button>
    </div>
  );
};

export default ViewModeSwitch;