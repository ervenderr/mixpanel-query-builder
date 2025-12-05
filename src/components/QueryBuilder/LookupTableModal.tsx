'use client';

import { useState, useRef, useEffect } from 'react';

interface LookupTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProperty?: string;
}

export default function LookupTableModal({ isOpen, onClose, currentProperty }: LookupTableModalProps) {
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(currentProperty || '');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApply = () => {
    console.log('Apply lookup table mapping:', { selectedTable, selectedProperty });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[700px] mx-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-10 py-8">
          <h2 className="text-[28px] font-light text-[#2a2a2f]">Create Lookup Table Mapping</h2>
          <button
            onClick={onClose}
            className="p-1 text-[#626266] hover:text-[#2a2a2f] transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-10 pb-10">
          {/* Lookup Table Section */}
          <div className="mb-12">
            <label className="block text-[17px] font-light text-[#2a2a2f] mb-4">
              Lookup Table
            </label>
            <div className="flex items-center gap-4">
              {/* Select Existing Dropdown */}
              <div className="flex-1 relative">
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full px-4 py-3 border border-[#e9e9e9] rounded-lg text-[15px] font-light text-[#2a2a2f] bg-white outline-none focus:border-[#4f44e0] cursor-pointer appearance-none pr-10"
                >
                  <option value="">Select Existing</option>
                  <option value="table1">User Segments</option>
                  <option value="table2">Product Categories</option>
                  <option value="table3">Region Mapping</option>
                </select>
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#626266] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>

              {/* Or Text */}
              <span className="text-[15px] font-light text-[#8f8f91]">or</span>

              {/* Import CSV Button */}
              <button
                className="flex items-center gap-2.5 px-5 py-3 text-[15px] font-light text-[#2a2a2f] bg-[#edecfc] hover:bg-[#e0ddf8] rounded-lg transition-colors whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Import CSV
              </button>
            </div>
          </div>

          {/* Map to Property Section */}
          <div className="mb-0">
            <label className="block text-[17px] font-light text-[#2a2a2f] mb-4">
              Map to Property
            </label>
            <div className="flex items-center gap-3 px-4 py-3.5 bg-[#f6f6f6] rounded-lg">
              <svg className="w-5 h-5 text-[#8f8f91]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span className="text-[15px] font-light text-[#8f8f91]">{currentProperty || 'age'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-10 py-7 mt-8">
          {/* Learn more link */}
          <button className="flex items-center gap-2.5 text-[15px] font-light text-[#8f8f91] hover:text-[#4f44e0] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            Learn more about Lookup Tables
          </button>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-7 py-2.5 text-[15px] font-light text-[#2a2a2f] hover:bg-[#f6f6f6] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-7 py-2.5 text-[15px] font-light text-white bg-[#4f44e0] hover:bg-[#3d35c0] rounded-lg transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
