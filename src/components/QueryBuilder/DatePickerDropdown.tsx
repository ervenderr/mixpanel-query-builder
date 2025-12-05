'use client';

import { useState, useRef, useEffect } from 'react';

interface DatePickerDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function DatePickerDropdown({ value, onChange }: DatePickerDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '7');
  const [unit, setUnit] = useState('days');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleApply = () => {
    onChange(`${inputValue} ${unit}`);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  // Calendar logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = (monthOffset = 0) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, 1);
    const daysInMonth = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-[48px] h-9" />);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const isInRange = monthOffset === 0 && day >= 24 && day <= 30; // Example range
      const isSelected = monthOffset === 0 && day === 26; // Example selected date
      days.push(
        <button
          key={day}
          type="button"
          className={`w-[48px] h-9 flex items-center justify-center rounded-full text-sm transition-colors font-light ${
            isSelected
              ? 'bg-[#4f44e0] text-white'
              : isInRange
              ? 'bg-[#edecfc] text-[#2a2a2f]'
              : 'text-[#2a2a2f] hover:bg-[#edecfc]'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-transparent border-0 outline-none text-sm text-[#2a2a2f] cursor-pointer font-light hover:text-[#4f44e0] transition-colors pointer-events-auto"
      >
        {value || '7 days'}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[380px] bg-white rounded-lg shadow-[0_4px_10px_rgba(55,56,60,0.16),0_0_2px_rgba(55,56,60,0.48)] border border-[#e9e9e9] z-50 p-4">
          {/* Input section */}
          <div className="flex items-center gap-2 mb-4">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-3 py-2 border-2 border-[#4f44e0] rounded-md text-sm outline-none font-light"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="px-3 py-2 border border-[#e9e9e9] rounded-md text-sm outline-none bg-[#f6f6f6] cursor-pointer font-light"
            >
              <option value="days">days</option>
              <option value="weeks">weeks</option>
              <option value="months">months</option>
              <option value="years">years</option>
            </select>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="w-[48px] text-center text-xs text-[#8f8f91] font-light">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5 mb-3">
            {renderCalendar(0)}
          </div>

          {/* Month label */}
          <div className="text-center text-sm font-light text-[#2a2a2f] mb-4">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>

          {/* Second month calendar */}
          <div className="grid grid-cols-7 gap-0.5 mb-3">
            {renderCalendar(1)}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#e9e9e9]">
            <button
              type="button"
              onClick={() => {}}
              className="flex items-center gap-2 px-2.5 py-1.5 text-sm text-[#2a2a2f] hover:bg-[#f6f6f6] rounded-md transition-colors font-light"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m8.66-11L15 12l5.66 5.66M3.34 6.34 9 12 3.34 17.66"/>
              </svg>
              Advanced
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-1.5 text-sm text-[#2a2a2f] hover:bg-[#f6f6f6] rounded-md transition-colors font-light"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-3 py-1.5 text-sm text-white bg-[#4f44e0] hover:bg-[#3d35c0] rounded-md transition-colors font-light"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
