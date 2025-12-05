'use client';

import { useState, useRef, useEffect } from 'react';
import { fields } from '@/lib/fields';
import FieldIcon from './FieldIcon';

interface FieldSelectDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function FieldSelectDropdown({ value, onChange }: FieldSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedField = fields.find((f) => f.name === value);

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

  const filteredFields = fields.filter((f) => {
    const matchesSearch = f.label.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || f.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelect = (fieldName: string) => {
    onChange(fieldName);
    setIsOpen(false);
    setSearch('');
  };

  const infoField = hoveredField ? fields.find((f) => f.name === hoveredField) : null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button with breadcrumb label */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-transparent border-0 outline-none text-sm text-[#2a2a2f] cursor-pointer font-light hover:text-[#4f44e0] transition-colors w-full text-left"
      >
        {selectedField ? (selectedField.displayLabel || selectedField.label) : 'Select property...'}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[900px] bg-white rounded-lg shadow-[0_4px_10px_rgba(55,56,60,0.16),0_0_2px_rgba(55,56,60,0.48)] border border-[#e9e9e9] z-50">
          {/* Search input */}
          <div className="p-4 border-b border-[#e9e9e9]">
            <div className="flex items-center gap-2 px-3 py-2 border-2 border-[#4f44e0] rounded-md bg-white">
              <svg className="w-4 h-4 text-[#8f8f91]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth={2}/>
                <path d="m21 21-4.35-4.35" strokeWidth={2} strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="flex-1 outline-none text-sm bg-transparent"
                autoFocus
              />
            </div>
          </div>

          <div className="flex max-h-[400px]">
            {/* Left sidebar - categories */}
            <div className="w-[200px] border-r border-[#e9e9e9] p-2">
              <button
                onClick={() => setActiveCategory('All')}
                className={`w-full px-3 py-2 text-sm rounded-md mb-1 text-left transition-colors font-light ${
                  activeCategory === 'All'
                    ? 'text-[#4f44e0] bg-[#edecfc]'
                    : 'text-[#2a2a2f] hover:bg-[#f6f6f6]'
                }`}
              >
                <span className="mr-2">Aa</span>
                All
              </button>
              <button
                onClick={() => setActiveCategory('User')}
                className={`w-full px-3 py-2 text-sm rounded-md mb-1 text-left transition-colors font-light ${
                  activeCategory === 'User'
                    ? 'text-[#4f44e0] bg-[#edecfc]'
                    : 'text-[#2a2a2f] hover:bg-[#f6f6f6]'
                }`}
              >
                <span className="mr-2">≋</span>
                User
              </button>
              <button
                onClick={() => setActiveCategory('Computed')}
                className={`w-full px-3 py-2 text-sm rounded-md mb-1 text-left transition-colors font-light ${
                  activeCategory === 'Computed'
                    ? 'text-[#4f44e0] bg-[#edecfc]'
                    : 'text-[#2a2a2f] hover:bg-[#f6f6f6]'
                }`}
              >
                <span className="mr-2">⊞</span>
                Computed
              </button>
              <button
                onClick={() => setActiveCategory('Cohorts')}
                className={`w-full px-3 py-2 text-sm rounded-md text-left transition-colors font-light ${
                  activeCategory === 'Cohorts'
                    ? 'text-[#4f44e0] bg-[#edecfc]'
                    : 'text-[#2a2a2f] hover:bg-[#f6f6f6]'
                }`}
              >
                <span className="mr-2">⚘</span>
                Cohorts
              </button>
            </div>

            {/* Middle content - fields */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="px-2 py-1 text-xs font-light text-[#8f8f91] uppercase mb-1">
                All Properties
              </div>

              {filteredFields.map((field) => (
                <button
                  key={field.name}
                  onClick={() => handleSelect(field.name)}
                  onMouseEnter={() => setHoveredField(field.name)}
                  onMouseLeave={() => setHoveredField(null)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left font-light ${
                    field.name === value
                      ? 'bg-[#4f44e0] text-white'
                      : hoveredField === field.name
                      ? 'bg-[#4f44e0] text-white'
                      : 'text-[#2a2a2f] hover:bg-[#edecfc]'
                  }`}
                >
                  <FieldIcon icon={field.icon} />
                  <span className={hoveredField === field.name || field.name === value ? 'text-white' : 'text-[#8f8f91]'}>{field.category} ▸</span>
                  <span>{field.label}</span>
                </button>
              ))}
            </div>

            {/* Right side info panel */}
            {infoField && (
              <div className="w-[280px] border-l border-[#e9e9e9] p-4 bg-[#fafbfd]">
                <div className="flex items-center gap-2 mb-3">
                  <FieldIcon icon={infoField.icon} />
                  <h4 className="font-light text-[#2a2a2f]">{infoField.label}</h4>
                </div>
                {infoField.description && (
                  <p className="text-sm text-[#626266] leading-relaxed font-light">
                    {infoField.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
