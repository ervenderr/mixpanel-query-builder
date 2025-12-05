'use client';

import { useState, useRef, useEffect } from 'react';
import type { FieldType } from '@/types';

interface FieldOptionsMenuProps {
  currentType: FieldType;
  onTypeChange?: (type: FieldType) => void;
  onMapLookup?: () => void;
  onDuplicate?: () => void;
}

export default function FieldOptionsMenu({ currentType, onTypeChange, onMapLookup, onDuplicate }: FieldOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDataTypeSubmenu, setShowDataTypeSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowDataTypeSubmenu(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleTypeSelect = (type: FieldType) => {
    onTypeChange?.(type);
    setIsOpen(false);
    setShowDataTypeSubmenu(false);
  };

  const dataTypes: { value: FieldType; label: string; icon: JSX.Element }[] = [
    {
      value: 'string',
      label: 'String',
      icon: <span className="text-lg">Aa</span>,
    },
    {
      value: 'number',
      label: 'Number',
      icon: <span className="text-lg font-semibold">#</span>,
    },
    {
      value: 'date',
      label: 'Date',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Three dots button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-[#8f8f91] hover:text-[#626266] hover:bg-[#f6f6f6] rounded transition-colors"
        aria-label="More options"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </button>

      {/* Main dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[280px] bg-white rounded-lg shadow-[0_4px_10px_rgba(55,56,60,0.16),0_0_2px_rgba(55,56,60,0.48)] border border-[#e9e9e9] z-50 py-2">
          {/* Data Type option */}
          <button
            onMouseEnter={() => setShowDataTypeSubmenu(true)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm text-[#4f44e0] bg-[#edecfc] transition-colors font-light"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold">#</span>
              <span>Data Type</span>
            </div>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>

          {/* Map Lookup Table option */}
          <button
            onClick={() => {
              onMapLookup?.();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#2a2a2f] hover:bg-[#f6f6f6] transition-colors font-light"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
            <span>Map Lookup Table</span>
          </button>

          {/* Duplicate option */}
          <button
            onClick={() => {
              onDuplicate?.();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#2a2a2f] hover:bg-[#f6f6f6] transition-colors font-light"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            <span>Duplicate</span>
          </button>

          {/* Data Type Submenu */}
          {showDataTypeSubmenu && (
            <div
              className="absolute left-full top-0 ml-1 w-[220px] bg-white rounded-lg shadow-[0_4px_10px_rgba(55,56,60,0.16),0_0_2px_rgba(55,56,60,0.48)] border border-[#e9e9e9] py-2"
              onMouseLeave={() => setShowDataTypeSubmenu(false)}
            >
              {dataTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeSelect(type.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors font-light ${
                    currentType === type.value
                      ? 'bg-[#4f44e0] text-white'
                      : 'text-[#2a2a2f] hover:bg-[#edecfc]'
                  }`}
                >
                  {type.icon}
                  <span>{type.label}</span>
                </button>
              ))}

              {/* True / False option */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#2a2a2f] hover:bg-[#edecfc] transition-colors font-light"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                </svg>
                <span>True / False</span>
              </button>

              {/* List option */}
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-[#2a2a2f] hover:bg-[#edecfc] transition-colors font-light"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <line x1="8" y1="6" x2="21" y2="6"/>
                    <line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/>
                    <line x1="3" y1="12" x2="3.01" y2="12"/>
                    <line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                  <span>List</span>
                </div>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
