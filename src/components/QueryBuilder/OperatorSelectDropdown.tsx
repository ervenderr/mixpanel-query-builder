'use client';

import { useState, useRef, useEffect } from 'react';
import type { Operator } from '@/types';

interface OperatorSelectDropdownProps {
  operators: Operator[];
  value: string;
  onChange: (value: string) => void;
}

export default function OperatorSelectDropdown({
  operators,
  value,
  onChange,
}: OperatorSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOp = operators.find((op) => op.name === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (opName: string) => {
    onChange(opName);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-transparent border-0 outline-none text-sm text-[#2a2a2f] cursor-pointer font-light hover:text-[#4f44e0] transition-colors pointer-events-auto"
      >
        {selectedOp ? selectedOp.label : 'Select...'}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[280px] bg-white rounded-lg shadow-[0_4px_10px_rgba(55,56,60,0.16),0_0_2px_rgba(55,56,60,0.48)] border border-[#e9e9e9] z-50 py-1">
          {operators.map((op) => (
            <button
              key={op.name}
              onClick={() => handleSelect(op.name)}
              className={`w-full px-4 py-2.5 text-sm text-left transition-colors font-light ${
                op.name === value
                  ? 'bg-[#4f44e0] text-white'
                  : 'text-[#2a2a2f] hover:bg-[#edecfc]'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
