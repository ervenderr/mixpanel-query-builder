'use client';

import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import Calendar from './Calendar';

interface SingleDatePickerDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SingleDatePickerDropdown({ value, onChange }: SingleDatePickerDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value) : new Date()
  );
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
    setSelectedDate(date);
    // Format as yyyy-MM-dd for the value
    const formattedDate = format(date, 'yyyy-MM-dd');
    onChange(formattedDate);
  };

  const handleApply = () => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      onChange(formattedDate);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
    // Reset to current value
    setSelectedDate(value ? new Date(value) : null);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const displayValue = selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Select date...';

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
          {/* Date input */}
          <div className="mb-4">
            <input
              type="date"
              value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                if (e.target.value) {
                  const date = new Date(e.target.value);
                  setSelectedDate(date);
                  setCurrentMonth(date);
                }
              }}
              className="w-full px-3 py-2 border-2 border-[#4f44e0] rounded-md text-sm outline-none font-light bg-white text-[#2a2a2f]"
            />
          </div>

          {/* Calendar */}
          <Calendar
            currentMonth={currentMonth}
            selectedRange={
              selectedDate
                ? { start: selectedDate, end: selectedDate }
                : { start: null, end: null }
            }
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
