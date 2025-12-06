'use client';

import { useState, useRef, useEffect } from 'react';
import { format, subDays, subWeeks, subMonths, subYears } from 'date-fns';

interface DatePickerDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function DatePickerDropdown({ value, onChange }: DatePickerDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, unit] = value.split(',');
  const [inputValue, setInputValue] = useState(amount || '7');
  const [selectedUnit, setSelectedUnit] = useState(unit || 'days');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [rangeSelectionMode, setRangeSelectionMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate date range based on current values
  useEffect(() => {
    const num = parseInt(inputValue, 10);
    if (isNaN(num)) return;

    const endDate = new Date();
    let startDate: Date;

    switch (selectedUnit) {
      case 'days':
        startDate = subDays(endDate, num);
        break;
      case 'weeks':
        startDate = subWeeks(endDate, num);
        break;
      case 'months':
        startDate = subMonths(endDate, num);
        break;
      case 'years':
        startDate = subYears(endDate, num);
        break;
      default:
        startDate = subDays(endDate, num);
    }

    setSelectedRange({ start: startDate, end: endDate });
  }, [inputValue, selectedUnit]);

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
    onChange(`${inputValue},${selectedUnit}`);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
    // Reset to current values
    setInputValue(amount || '7');
    setSelectedUnit(unit || 'days');
  };

  // Calendar rendering functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    // Convert Sunday (0) to 6, Monday (1) to 0, etc. for Mon-Sun week
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const isDateInRange = (date: Date) => {
    if (!selectedRange.start || !selectedRange.end) return false;
    const dateStr = date.toDateString();
    const startStr = selectedRange.start.toDateString();
    const endStr = selectedRange.end.toDateString();
    return date >= selectedRange.start && date <= selectedRange.end;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    // When clicking a date, calculate the range from that date to today
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setInputValue(diffDays.toString());
    setSelectedRange({ start: date, end: today });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-8" />);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const inRange = isDateInRange(date);
      const today = isToday(date);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(date)}
          className={`w-10 h-8 flex items-center justify-center rounded text-sm transition-colors font-light ${
            today
              ? 'bg-[#4f44e0] text-white font-medium'
              : inRange
              ? 'bg-[#c7c3fa] text-[#2a2a2f]'
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
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const displayValue = `${inputValue} ${selectedUnit}`;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-transparent border-0 outline-none text-sm text-[#2a2a2f] cursor-pointer font-light hover:text-[#4f44e0] transition-colors w-full text-left"
      >
        {displayValue}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[360px] bg-white rounded-lg shadow-[0_4px_10px_rgba(55,56,60,0.16),0_0_2px_rgba(55,56,60,0.48)] border border-[#e9e9e9] z-50 p-4">
          {/* Number input + Unit dropdown section */}
          <div className="flex items-center gap-2 mb-4">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-3 py-2 border-2 border-[#4f44e0] rounded-md text-sm outline-none font-light bg-white text-[#2a2a2f]"
              min="1"
            />
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="px-3 py-2 border border-[#e9e9e9] rounded-md text-sm outline-none bg-[#f6f6f6] text-[#2a2a2f] cursor-pointer font-light"
            >
              <option value="days">days</option>
              <option value="weeks">weeks</option>
              <option value="months">months</option>
              <option value="years">years</option>
            </select>
          </div>

          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={previousMonth}
              className="p-1 hover:bg-[#f6f6f6] rounded transition-colors"
              aria-label="Previous month"
            >
              <svg className="w-5 h-5 text-[#2a2a2f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-sm font-medium text-[#2a2a2f]">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-[#f6f6f6] rounded transition-colors"
              aria-label="Next month"
            >
              <svg className="w-5 h-5 text-[#2a2a2f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="w-10 text-center text-xs text-[#8f8f91] font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-y-1 mb-4">{renderCalendar()}</div>

          {/* Advanced options */}
          {showAdvanced && (
            <div className="mb-4 p-3 bg-[#f6f6f6] rounded-md">
              <button
                type="button"
                onClick={() => setRangeSelectionMode(!rangeSelectionMode)}
                className="flex items-center gap-2 text-sm text-[#4f44e0] hover:text-[#3d35c0] font-light"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Enable Time Ranges
              </button>
              {rangeSelectionMode && (
                <div className="mt-2 text-xs text-[#8f8f91]">
                  Click on dates in the calendar to select a custom range
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#e9e9e9]">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#2a2a2f] hover:bg-[#f6f6f6] rounded-md transition-colors font-light"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Advanced
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-1.5 text-sm text-[#2a2a2f] hover:bg-[#f6f6f6] rounded-md transition-colors font-light"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-1.5 text-sm text-white bg-[#4f44e0] hover:bg-[#3d35c0] rounded-md transition-colors font-medium"
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
