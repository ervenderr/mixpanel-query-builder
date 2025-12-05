'use client';

import type { Operator } from '@/types';

interface OperatorSelectProps {
  operators: Operator[];
  value: string;
  onChange: (value: string) => void;
}

export default function OperatorSelect({
  operators,
  value,
  onChange,
}: OperatorSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-transparent border-0 outline-none text-sm text-[#2a2a2f] cursor-pointer appearance-none pr-0 font-normal"
    >
      <option value="">Select...</option>
      {operators.map((op) => (
        <option key={op.name} value={op.name}>
          {op.label}
        </option>
      ))}
    </select>
  );
}
