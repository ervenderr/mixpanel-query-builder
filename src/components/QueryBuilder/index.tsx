'use client';

import { useState, useCallback } from 'react';
import type { RuleGroupType, RuleType } from 'react-querybuilder';
import FilterRow from './FilterRow';

interface QueryBuilderProps {
  onQueryChange: (query: RuleGroupType) => void;
}

// Using react-querybuilder types but custom UI components to match Mixpanel exactly
// State is just an array of filter objects - parent gets notified on changes
export default function QueryBuilder({ onQueryChange }: QueryBuilderProps) {
  // Start with one empty filter row (Mixpanel does this too)
  const [filters, setFilters] = useState<RuleType[]>([
    {
      id: crypto.randomUUID(),
      field: '',
      operator: '',
      value: '',
    },
  ]);

  // Filter out incomplete rules (missing field/operator/value)
  // Lets users gradually fill in a row without breaking the query
  const buildQuery = useCallback((currentFilters: RuleType[]): RuleGroupType => {
    return {
      combinator: 'and',
      rules: currentFilters.filter(
        (f) => f.field && f.operator && f.value
      ),
    };
  }, []);

  // Single update point - keeps local state and parent callback in sync
  const updateQuery = useCallback((newFilters: RuleType[]) => {
    setFilters(newFilters);
    onQueryChange(buildQuery(newFilters));
  }, [buildQuery, onQueryChange]);

  // Reset operator and value when field changes
  // Different field types have different valid operators
  const handleFieldChange = useCallback((id: string, field: string) => {
    const newFilters = filters.map((f) =>
      f.id === id ? { ...f, field, operator: '', value: '' } : f
    );
    updateQuery(newFilters);
  }, [filters, updateQuery]);

  const handleOperatorChange = useCallback((id: string, operator: string) => {
    const newFilters = filters.map((f) =>
      f.id === id ? { ...f, operator } : f
    );
    updateQuery(newFilters);
  }, [filters, updateQuery]);

  const handleValueChange = useCallback((id: string, value: string) => {
    const newFilters = filters.map((f) =>
      f.id === id ? { ...f, value } : f
    );
    updateQuery(newFilters);
  }, [filters, updateQuery]);

  const handleRemove = useCallback((id: string) => {
    const newFilters = filters.filter((f) => f.id !== id);
    updateQuery(newFilters);
  }, [filters, updateQuery]);

  // Copy existing filter with new ID for React keys
  const handleDuplicate = useCallback((id: string) => {
    const filterToDuplicate = filters.find((f) => f.id === id);
    if (filterToDuplicate) {
      const duplicatedFilter = {
        ...filterToDuplicate,
        id: crypto.randomUUID(),
      };
      const newFilters = [...filters, duplicatedFilter];
      updateQuery(newFilters);
    }
  }, [filters, updateQuery]);

  const handleAddFilter = useCallback(() => {
    const newFilters = [
      ...filters,
      {
        id: crypto.randomUUID(),
        field: '',
        operator: '',
        value: '',
      },
    ];
    updateQuery(newFilters);
  }, [filters, updateQuery]);

  return (
    <div>
      {/* ALL USERS group label */}
      <div className="flex items-center gap-2 mb-4 text-xs text-[#8f8f91] uppercase tracking-wider font-medium">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        ALL USERS
      </div>

      {/* Filter rows */}
      <div className="space-y-3">
        {filters.map((filter, index) => (
          <FilterRow
            key={filter.id}
            id={filter.id!}
            field={filter.field}
            operator={filter.operator}
            value={filter.value}
            onFieldChange={handleFieldChange}
            onOperatorChange={handleOperatorChange}
            onValueChange={handleValueChange}
            onRemove={handleRemove}
            onDuplicate={handleDuplicate}
            showRemove={filters.length > 1}
            showAnd={index > 0}
          />
        ))}
      </div>

      {/* + Filter button matching Mixpanel */}
      <button
        onClick={handleAddFilter}
        className="flex items-center gap-2 mt-3 px-3 py-2 text-sm font-medium text-[#4f44e0] bg-[#edecfc] hover:bg-[#e0ddf8] rounded-md transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Filter
      </button>
    </div>
  );
}
