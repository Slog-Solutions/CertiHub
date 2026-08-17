import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';

const ActionsDropdown = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center text-[var(--text-muted)] hover:text-[var(--text-dark)] p-1 rounded-md hover:bg-[var(--bg-cream)] border border-[var(--border-color)] transition-colors duration-150"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
 
      {isOpen && (
        <div className="absolute right-0 mt-1 w-28 rounded-md bg-[var(--bg-card)] border border-[var(--border-color)] shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="none">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onEdit();
                }}
                className="flex w-full items-center px-3 py-2 text-xs text-[var(--text-dark)] hover:bg-[var(--bg-cream)] hover:text-emerald-500 transition-colors duration-150"
              >
                <Edit2 className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onDelete();
                }}
                className="flex w-full items-center px-3 py-2 text-xs text-rose-500 hover:bg-[var(--bg-cream)] hover:text-rose-600 transition-colors duration-150"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5 text-rose-500" />
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionsDropdown;
