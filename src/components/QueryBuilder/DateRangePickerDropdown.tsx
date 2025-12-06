'use client';

import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import Calendar from './Calendar';

interface DateRangePickerDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function DateRangePickerDropdown({ value, onChange }: DateRangePickerDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [start, end] = value.split(',');
  const [startDate, setStartDate] = useState<Date | null>(start ? new Date(start) : null);
  const [endDate, setEndDate] = useState<Date | null>(end ? new Date(end) : null);
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

  const handleDateClick = (date: Date) => {
    // If no start date, set start date
    if (!startDate) {
      setStartDate(date);
      setCurrentMonth(date);
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
      setCurrentMonth(date);
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

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const displayValue =
    startDate && endDate
      ? `${format(startDate, 'MMM dd, yyyy')} — ${format(endDate, 'MMM dd, yyyy')}`
      : 'Select date range...';

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
          {/* Date range inputs */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1">
              <label className="block text-xs text-[#8f8f91] mb-1 font-light">Start</label>
              <input
                type="date"
                value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    const date = new Date(e.target.value);
                    setStartDate(date);
                    setCurrentMonth(date);
                  }
                }}
                className="w-full px-3 py-2 border-2 border-[#4f44e0] rounded-md text-sm outline-none font-light bg-white text-[#2a2a2f]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-[#8f8f91] mb-1 font-light">End</label>
              <input
                type="date"
                value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setEndDate(new Date(e.target.value));
                  }
                }}
                className="w-full px-3 py-2 border border-[#e9e9e9] rounded-md text-sm outline-none font-light bg-white text-[#2a2a2f]"
              />
            </div>
          </div>

          {/* Calendar */}
          <Calendar
            currentMonth={currentMonth}
            selectedRange={{ start: startDate, end: endDate }}
            onDateClick={handleDateClick}
            onPreviousMonth={previousMonth}
            onNextMonth={nextMonth}
          />

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 mt-4 border-t border-[#e9e9e9]">
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
      )}
    </div>
  );
}
