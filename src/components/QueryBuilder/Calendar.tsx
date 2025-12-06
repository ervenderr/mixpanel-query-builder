'use client';

import { format } from 'date-fns';

interface CalendarProps {
  currentMonth: Date;
  selectedRange?: { start: Date | null; end: Date | null };
  onDateClick?: (date: Date) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export default function Calendar({
  currentMonth,
  selectedRange,
  onDateClick,
  onPreviousMonth,
  onNextMonth,
}: CalendarProps) {
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
    if (!selectedRange?.start || !selectedRange?.end) return false;
    return date >= selectedRange.start && date <= selectedRange.end;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (date: Date) => {
    if (!selectedRange?.start) return false;
    return date.toDateString() === selectedRange.start.toDateString();
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
      const selected = isSelectedDate(date);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => onDateClick?.(date)}
          className={`w-10 h-8 flex items-center justify-center rounded text-sm transition-colors font-light ${
            today
              ? 'bg-[#4f44e0] text-white font-medium'
              : selected
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

  return (
    <>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={onPreviousMonth}
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
          onClick={onNextMonth}
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
      <div className="grid grid-cols-7 gap-y-1">{renderCalendar()}</div>
    </>
  );
}
