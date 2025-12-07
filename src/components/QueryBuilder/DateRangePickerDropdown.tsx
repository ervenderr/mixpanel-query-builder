'use client';

import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';

interface DateRangePickerDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function DateRangePickerDropdown({ value, onChange }: DateRangePickerDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [start, end] = value.split(',');
  const [startDate, setStartDate] = useState<Date | null>(start ? new Date(start) : null);
  const [endDate, setEndDate] = useState<Date | null>(end ? new Date(end) : null);
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

  const handleDateClick = (date: Date) => {
    // If no start date, set start date
    if (!startDate) {
      setStartDate(date);
    }
    // If start date exists but no end date, set end date
    else if (!endDate) {
      // Ensure end date is after start date
      if (date >= startDate) {
        setEndDate(date);
      } else {
        // If clicked date is before start, swap them
        setEndDate(startDate);
        setStartDate(date);
      }
    }
    // If both dates exist, start new selection
    else {
      setStartDate(date);
      setEndDate(null);
    }
  };

  const handleApply = () => {
    if (startDate && endDate) {
      const formattedStart = format(startDate, 'yyyy-MM-dd');
      const formattedEnd = format(endDate, 'yyyy-MM-dd');
      onChange(`${formattedStart},${formattedEnd}`);
    } else if (startDate) {
      // If only start date is set, use it for both
      const formattedStart = format(startDate, 'yyyy-MM-dd');
      onChange(`${formattedStart},${formattedStart}`);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
    // Reset to current values
    const [currentStart, currentEnd] = value.split(',');
    setStartDate(currentStart ? new Date(currentStart) : null);
    setEndDate(currentEnd ? new Date(currentEnd) : null);
  };

  const displayValue =
    startDate && endDate
      ? `${format(startDate, 'MMM dd, yyyy')} — ${format(endDate, 'MMM dd, yyyy')}`
      : 'Select date range...';

  // Generate months to display (show 12 months starting from current month)
  const generateMonths = () => {
    const months = [];
    const today = new Date();
    const startMonth = new Date(today.getFullYear(), today.getMonth() - 2, 1); // Start 2 months ago

    for (let i = 0; i < 16; i++) {
      const month = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
      months.push(month);
    }

    return months;
  };

  const renderMonth = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Convert Sunday (0) to 6, Monday (1) to 0

    const days = [];

    // Month name
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Empty cells for days before the first day
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-8" />);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isInRange = startDate && endDate && date >= startDate && date <= endDate;
      const isStart = startDate && date.toDateString() === startDate.toDateString();
      const isEnd = endDate && date.toDateString() === endDate.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(date)}
          className={`w-10 h-8 flex items-center justify-center rounded text-sm transition-colors font-light ${
            isStart || isEnd
              ? 'bg-[#4f44e0] text-white font-medium'
              : isInRange
              ? 'bg-[#c7c3fa] text-[#2a2a2f]'
              : isToday
              ? 'bg-[#4f44e0] text-white font-medium'
              : 'text-[#2a2a2f] hover:bg-[#edecfc]'
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div key={`${year}-${month}`} className="mb-6">
        <div className="text-sm font-medium text-[#2a2a2f] mb-3">{monthNames[month]} {year}</div>
        <div className="grid grid-cols-7 gap-y-1">{days}</div>
      </div>
    );
  };

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
          {/* Date range display (simplified) */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="text-xs text-[#8f8f91] mb-1 font-light">Start</div>
              <div className="text-sm text-[#2a2a2f] font-light">
                {startDate ? format(startDate, 'MMM dd, yyyy') : '—'}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-[#8f8f91] mb-1 font-light">End</div>
              <div className="text-sm text-[#2a2a2f] font-light">
                {endDate ? format(endDate, 'MMM dd, yyyy') : '—'}
              </div>
            </div>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="w-10 text-center text-xs text-[#8f8f91] font-normal">
                {day}
              </div>
            ))}
          </div>

          {/* Multi-month scrollable calendar */}
          <div className="max-h-[320px] overflow-y-auto mb-4">
            {generateMonths().map((month) => renderMonth(month))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#e9e9e9]">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#2a2a2f] hover:bg-[#f6f6f6] rounded-md transition-colors font-light"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
