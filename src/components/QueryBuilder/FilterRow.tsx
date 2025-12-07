'use client';

import { useState } from 'react';
import { fields } from '@/lib/fields';
import FieldSelectDropdown from './FieldSelectDropdown';
import OperatorSelectDropdown from './OperatorSelectDropdown';
import ValueInput from './ValueInput';
import FieldIcon from './FieldIcon';
import FieldOptionsMenu from './FieldOptionsMenu';
import LookupTableModal from './LookupTableModal';

interface FilterRowProps {
  id: string;
  field: string;
  operator: string;
  value: string;
  onFieldChange: (id: string, field: string) => void;
  onOperatorChange: (id: string, operator: string) => void;
  onValueChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  onDuplicate?: (id: string) => void;
  showRemove: boolean;
  showAnd: boolean;
  combinator?: 'and' | 'or';
  onCombinatorToggle?: () => void;
}

export default function FilterRow({
  id,
  field,
  operator,
  value,
  onFieldChange,
  onOperatorChange,
  onValueChange,
  onRemove,
  onDuplicate,
  showAnd,
  combinator = 'and',
  onCombinatorToggle,
}: FilterRowProps) {
  const selectedField = fields.find((f) => f.name === field);
  const [showLookupModal, setShowLookupModal] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3">
      {/* where/and/or label - clickable when showAnd is true */}
      {showAnd ? (
        <button
          onClick={onCombinatorToggle}
          className="text-sm text-[#4f44e0] min-w-[48px] hover:underline cursor-pointer bg-transparent border-0 outline-none font-medium"
          title="Click to toggle between AND/OR"
        >
          {combinator}
        </button>
      ) : (
        <span className="text-sm text-[#8f8f91] min-w-[48px]">where</span>
      )}

      {/* Field pill - outline on hover instead of border */}
      <div className="flex items-center gap-1.5 bg-[#f6f6f6] hover:bg-[#edecfc] hover:outline hover:outline-2 hover:outline-[#4f44e0] rounded-md px-2.5 py-1.5 transition-all">
        <FieldIcon icon={selectedField?.icon} />
        <FieldSelectDropdown value={field} onChange={(val) => onFieldChange(id, val)} />
      </div>

      {selectedField && (
        <>
          {/* Operator pill - outline on hover */}
          <div className="bg-[#f6f6f6] hover:bg-[#edecfc] hover:outline hover:outline-2 hover:outline-[#4f44e0] rounded-md px-2.5 py-1.5 transition-all">
            <OperatorSelectDropdown
              operators={selectedField.operators}
              value={operator}
              onChange={(val) => onOperatorChange(id, val)}
            />
          </div>

          {/* Value pill - only show if operator requires a value */}
          {!['isSet', 'isNotSet', 'isNumeric', 'isNotNumeric'].includes(operator) && (
            <div className="min-w-[120px]">
              <ValueInput
                type={selectedField.type}
                operator={operator}
                value={value}
                onChange={(val) => onValueChange(id, val)}
              />
            </div>
          )}
        </>
      )}

      {/* Three dots menu */}
      <FieldOptionsMenu
        currentType={selectedField?.type || 'string'}
        onTypeChange={(type) => {
          console.log('Type changed to:', type);
        }}
        onMapLookup={() => {
          setShowLookupModal(true);
        }}
        onDuplicate={() => {
          if (onDuplicate) {
            onDuplicate(id);
          }
        }}
      />

      {/* Delete */}
      <button
        onClick={() => onRemove(id)}
        className="p-1 text-[#8f8f91] hover:text-[#e34f2f] hover:bg-[#f6f6f6] rounded transition-colors"
        aria-label="Remove filter"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>

    {/* Lookup Table Modal */}
    <LookupTableModal
      isOpen={showLookupModal}
      onClose={() => setShowLookupModal(false)}
      currentProperty={selectedField?.label}
    />
  </>
  );
}
