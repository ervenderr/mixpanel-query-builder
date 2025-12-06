'use client';

import type { FieldType } from '@/types';
import DatePickerDropdown from './DatePickerDropdown';

interface ValueInputProps {
  type: FieldType;
  operator?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function ValueInput({ type, operator, value, onChange }: ValueInputProps) {
  const baseClasses =
    'bg-transparent border-0 outline-none text-sm text-[#2a2a2f] placeholder:text-[#8f8f91] font-light';

  // Handle "between" operator for numbers - needs two inputs
  if (type === 'number' && (operator === 'between' || operator === 'notBetween')) {
    const [min, max] = value.split(',');
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={min || ''}
          onChange={(e) => onChange(`${e.target.value},${max || ''}`)}
          placeholder="Min"
          className={`${baseClasses} w-16`}
        />
        <span className="text-[#8f8f91]">to</span>
        <input
          type="number"
          value={max || ''}
          onChange={(e) => onChange(`${min || ''},${e.target.value}`)}
          placeholder="Max"
          className={`${baseClasses} w-16`}
        />
      </div>
    );
  }

  // Handle "between" operator for dates - needs two date pickers
  if (type === 'date' && (operator === 'between' || operator === 'notBetween')) {
    const [start, end] = value.split(',');
    return (
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={start || ''}
          onChange={(e) => onChange(`${e.target.value},${end || ''}`)}
          className={`${baseClasses} w-32`}
        />
        <span className="text-[#8f8f91]">to</span>
        <input
          type="date"
          value={end || ''}
          onChange={(e) => onChange(`${start || ''},${e.target.value}`)}
          className={`${baseClasses} w-32`}
        />
      </div>
    );
  }

  // Handle "last" operator for dates - use enhanced calendar dropdown
  if (type === 'date' && operator === 'last') {
    return <DatePickerDropdown value={value} onChange={onChange} />;
  }

  if (type === 'number') {
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className={`${baseClasses} w-full`}
      />
    );
  }

  // For simple date operators (is, is not, after, before), use basic date input
  if (type === 'date') {
    return (
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${baseClasses} w-full`}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter value..."
      className={`${baseClasses} w-full`}
    />
  );
}
