import React from 'react';

const StatusToggle = ({ isActive, onToggle, disabled = false }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled && onToggle) onToggle();
      }}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[var(--bg-card)] ${
        isActive ? 'bg-emerald-500' : 'bg-rose-500'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={isActive ? 'Active (Click to Deactivate)' : 'Inactive (Click to Activate)'}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-[var(--bg-card)] transition-transform duration-300 ${
          isActive ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

export default StatusToggle;
