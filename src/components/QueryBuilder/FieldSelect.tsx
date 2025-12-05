'use client';

import { fields } from '@/lib/fields';

interface FieldSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function FieldSelect({ value, onChange }: FieldSelectProps) {
  const selectedField = fields.find((f) => f.name === value);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-transparent border-0 outline-none text-sm text-[#2a2a2f] cursor-pointer appearance-none pr-0 font-normal"
      style={{ minWidth: selectedField ? 'auto' : '120px' }}
    >
      <option value="">Select...</option>
      {fields.map((field) => (
        <option key={field.name} value={field.name}>
          {field.label}
        </option>
      ))}
    </select>
  );
}
