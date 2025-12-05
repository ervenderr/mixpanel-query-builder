'use client';

import type { FieldType } from '@/types';
import DatePickerDropdown from './DatePickerDropdown';

interface ValueInputProps {
  type: FieldType;
  value: string;
  onChange: (value: string) => void;
}

export default function ValueInput({ type, value, onChange }: ValueInputProps) {
  const baseClasses =
    'bg-transparent border-0 outline-none text-sm text-[#2a2a2f] placeholder:text-[#8f8f91] font-light';

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

  if (type === 'date') {
    return <DatePickerDropdown value={value} onChange={onChange} />;
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
