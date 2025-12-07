'use client';

import { useState, useCallback } from 'react';
import type { RuleGroupType, RuleType } from 'react-querybuilder';
import FilterRow from './FilterRow';
import { fields } from '@/lib/fields';

interface QueryBuilderProps {
  onQueryChange: (query: RuleGroupType) => void;
}

interface FilterGroup {
  id: string;
  filters: RuleType[];
  combinator: 'and' | 'or';
}

// Operators that don't require a value - moved outside component to avoid recreation
const OPERATORS_WITHOUT_VALUE = ['isSet', 'isNotSet', 'isNumeric', 'isNotNumeric'];

// Using react-querybuilder types but custom UI components to match Mixpanel exactly
// State is an array of groups, each containing filters - parent gets notified on changes
export default function QueryBuilder({ onQueryChange }: QueryBuilderProps) {
  // Start with one group containing one empty filter row (Mixpanel does this too)
  const [groups, setGroups] = useState<FilterGroup[]>([
    {
      id: crypto.randomUUID(),
      combinator: 'and' as const,
      filters: [
        {
          id: crypto.randomUUID(),
          field: '',
          operator: '',
          value: '',
        },
      ],
    },
  ]);

  // Track combinator (and/or) state between groups
  const [combinator, setCombinator] = useState<'and' | 'or'>('and');

  // Check if a filter is complete
  const isFilterComplete = useCallback((filter: RuleType) => {
    if (!filter.field || !filter.operator) return false;
    if (OPERATORS_WITHOUT_VALUE.includes(filter.operator as string)) return true;
    return filter.value !== undefined && filter.value !== '';
  }, []);

  // Check if there are any complete filters across all groups
  const hasCompleteFilters = useCallback(() => {
    return groups.some(group =>
      group.filters.some(filter => isFilterComplete(filter))
    );
  }, [groups, isFilterComplete]);

  // Filter out incomplete rules (missing field/operator/value)
  // Lets users gradually fill in a row without breaking the query
  // Some operators don't require a value (isSet, isNotSet, isNumeric, isNotNumeric)
  const buildQuery = useCallback((currentGroups: FilterGroup[], currentCombinator: 'and' | 'or'): RuleGroupType => {
    // Build nested groups
    const groupRules = currentGroups.map((group) => ({
      combinator: 'and' as const, // Within a group, filters are combined with AND
      rules: group.filters.filter((f) => isFilterComplete(f)),
    })).filter(group => group.rules.length > 0); // Only include groups that have valid rules

    // If only one group, return it directly (no nesting)
    if (groupRules.length === 1) {
      return groupRules[0];
    }

    // Multiple groups are combined with the global combinator (AND/OR)
    return {
      combinator: currentCombinator,
      rules: groupRules,
    };
  }, [isFilterComplete]);

  // Single update point - keeps local state and parent callback in sync
  const updateQuery = useCallback((newGroups: FilterGroup[]) => {
    setGroups(newGroups);
    onQueryChange(buildQuery(newGroups, combinator));
  }, [buildQuery, onQueryChange, combinator]);

  // Handle combinator toggle between groups
  const toggleCombinator = useCallback(() => {
    const newCombinator = combinator === 'and' ? 'or' : 'and';
    setCombinator(newCombinator);
    onQueryChange(buildQuery(groups, newCombinator));
  }, [combinator, groups, buildQuery, onQueryChange]);

  // Handle combinator toggle within a group
  const toggleGroupCombinator = useCallback((groupId: string) => {
    const newGroups = groups.map(group =>
      group.id === groupId
        ? { ...group, combinator: group.combinator === 'and' ? 'or' as const : 'and' as const }
        : group
    );
    setGroups(newGroups);
    onQueryChange(buildQuery(newGroups, combinator));
  }, [groups, combinator, buildQuery, onQueryChange]);

  // Reset operator and value when field changes
  // Different field types have different valid operators
  // Auto-select the first operator for all field types
  const handleFieldChange = useCallback((groupId: string, filterId: string, field: string) => {
    const fieldObj = fields.find(f => f.name === field);

    // Auto-select first operator for all field types
    let defaultOperator = '';
    let defaultValue = '';

    if (fieldObj && fieldObj.operators.length > 0) {
      defaultOperator = fieldObj.operators[0].name;

      // Set default value for date operators that need it
      if (fieldObj.type === 'date') {
        if (defaultOperator === 'last' || defaultOperator === 'notInTheLast' ||
            defaultOperator === 'beforeTheLast' || defaultOperator === 'inTheNext') {
          defaultValue = '7,days';
        }
      }
    }

    const newGroups = groups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            filters: group.filters.map((f) =>
              f.id === filterId ? { ...f, field, operator: defaultOperator, value: defaultValue } : f
            ),
          }
        : group
    );
    updateQuery(newGroups);
  }, [groups, updateQuery]);

  const handleOperatorChange = useCallback((groupId: string, filterId: string, operator: string) => {
    // Get default value based on operator type
    const getDefaultValue = (op: string, field: string) => {
      // Find the field to check its type
      const fieldObj = fields.find(f => f.name === field);

      // Auto-apply default values for date operators
      if (fieldObj?.type === 'date') {
        if (op === 'last' || op === 'notInTheLast' || op === 'beforeTheLast' || op === 'inTheNext') {
          return '7,days'; // Default to "7 days"
        }
      }
      return '';
    };

    const newGroups = groups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            filters: group.filters.map((f) =>
              f.id === filterId ? { ...f, operator, value: getDefaultValue(operator, f.field) } : f
            ),
          }
        : group
    );
    updateQuery(newGroups);
  }, [groups, updateQuery]);

  const handleValueChange = useCallback((groupId: string, filterId: string, value: string) => {
    const newGroups = groups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            filters: group.filters.map((f) =>
              f.id === filterId ? { ...f, value } : f
            ),
          }
        : group
    );
    updateQuery(newGroups);
  }, [groups, updateQuery]);

  const handleRemove = useCallback((groupId: string, filterId: string) => {
    const newGroups = groups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            filters: group.filters.filter((f) => f.id !== filterId),
          }
        : group
    ).filter(group => group.filters.length > 0); // Remove empty groups

    // Ensure at least one group with one filter
    if (newGroups.length === 0) {
      newGroups.push({
        id: crypto.randomUUID(),
        combinator: 'and' as const,
        filters: [{
          id: crypto.randomUUID(),
          field: '',
          operator: '',
          value: '',
        }],
      });
    }
    updateQuery(newGroups);
  }, [groups, updateQuery]);

  // Copy existing filter with new ID for React keys
  const handleDuplicate = useCallback((groupId: string, filterId: string) => {
    const newGroups = groups.map((group) => {
      if (group.id === groupId) {
        const filterToDuplicate = group.filters.find((f) => f.id === filterId);
        if (filterToDuplicate) {
          return {
            ...group,
            filters: [
              ...group.filters,
              {
                ...filterToDuplicate,
                id: crypto.randomUUID(),
              },
            ],
          };
        }
      }
      return group;
    });
    updateQuery(newGroups);
  }, [groups, updateQuery]);

  const handleAddFilter = useCallback((groupId: string) => {
    const newGroups = groups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            filters: [
              ...group.filters,
              {
                id: crypto.randomUUID(),
                field: '',
                operator: '',
                value: '',
              },
            ],
          }
        : group
    );
    updateQuery(newGroups);
  }, [groups, updateQuery]);

  const handleAddGroup = useCallback(() => {
    const newGroups = [
      ...groups,
      {
        id: crypto.randomUUID(),
        combinator: 'and' as const,
        filters: [
          {
            id: crypto.randomUUID(),
            field: '',
            operator: '',
            value: '',
          },
        ],
      },
    ];
    updateQuery(newGroups);
  }, [groups, updateQuery]);

  const handleClearAll = useCallback(() => {
    const newGroups = [{
      id: crypto.randomUUID(),
      combinator: 'and' as const,
      filters: [{
        id: crypto.randomUUID(),
        field: '',
        operator: '',
        value: '',
      }],
    }];
    setGroups(newGroups);
    setCombinator('and');
    onQueryChange(buildQuery(newGroups, 'and'));
  }, [buildQuery, onQueryChange]);

  // Drag and drop state and handlers
  const [draggedGroupId, setDraggedGroupId] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, groupId: string) => {
    setDraggedGroupId(groupId);

    // Set custom drag image to show entire group with subtle border
    // Find the parent group container (3 levels up from the drag icon)
    const dragIcon = e.currentTarget as HTMLElement;
    const groupContainer = dragIcon.parentElement?.parentElement;

    if (groupContainer) {
      // Clone the entire group container to use as drag image
      const dragImage = groupContainer.cloneNode(true) as HTMLElement;
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-9999px';
      dragImage.style.width = `${groupContainer.offsetWidth}px`;
      dragImage.style.backgroundColor = 'white';
      dragImage.style.border = '1px solid #e9e9e9';
      dragImage.style.borderRadius = '8px';
      dragImage.style.padding = '12px';
      dragImage.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      document.body.appendChild(dragImage);

      e.dataTransfer.setDragImage(dragImage, 0, 0);

      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((targetGroupId: string) => {
    if (!draggedGroupId || draggedGroupId === targetGroupId) {
      setDraggedGroupId(null);
      return;
    }

    const draggedIndex = groups.findIndex(g => g.id === draggedGroupId);
    const targetIndex = groups.findIndex(g => g.id === targetGroupId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedGroupId(null);
      return;
    }

    const newGroups = [...groups];
    const [draggedGroup] = newGroups.splice(draggedIndex, 1);
    newGroups.splice(targetIndex, 0, draggedGroup);

    updateQuery(newGroups);
    setDraggedGroupId(null);
  }, [draggedGroupId, groups, updateQuery]);

  return (
    <div className="relative">
      {groups.map((group, groupIndex) => (
        <div key={group.id}>
          {/* Horizontal separator with AND/OR button centered on the line */}
          {groupIndex > 0 && (
            <div className="relative my-6">
              <div className="border-t border-[#e9e9e9]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <button
                  onClick={toggleCombinator}
                  className="px-4 py-1.5 text-[13px] font-medium text-white bg-[#4f44e0] hover:bg-[#3d35c0] rounded-md transition-colors uppercase"
                >
                  {combinator}
                </button>
              </div>
            </div>
          )}

          {/* Group container */}
          <div
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(group.id)}
            className={`${draggedGroupId === group.id ? 'opacity-50' : ''}`}
          >
            {/* ALL USERS group label - only the drag icon is draggable */}
            <div className="flex items-center gap-2 mb-3 text-[11px] text-[#8f8f91] uppercase tracking-wide font-medium">
              {/* 6-dots drag handle icon - this is the draggable part */}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, group.id)}
                className="cursor-move"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                  <circle cx="3" cy="3" r="1.5" />
                  <circle cx="8" cy="3" r="1.5" />
                  <circle cx="3" cy="8" r="1.5" />
                  <circle cx="8" cy="8" r="1.5" />
                  <circle cx="3" cy="13" r="1.5" />
                  <circle cx="8" cy="13" r="1.5" />
                </svg>
              </div>
              <span>ALL USERS</span>
            </div>

            {/* Filter rows */}
            <div className="space-y-3 mb-3">
              {group.filters.map((filter, index) => (
                <FilterRow
                  key={filter.id}
                  id={filter.id!}
                  field={filter.field}
                  operator={filter.operator}
                  value={filter.value}
                  onFieldChange={(filterId, field) => handleFieldChange(group.id, filterId, field)}
                  onOperatorChange={(filterId, operator) => handleOperatorChange(group.id, filterId, operator)}
                  onValueChange={(filterId, value) => handleValueChange(group.id, filterId, value)}
                  onRemove={(filterId) => handleRemove(group.id, filterId)}
                  onDuplicate={(filterId) => handleDuplicate(group.id, filterId)}
                  showRemove={group.filters.length > 1 || groups.length > 1}
                  showAnd={index > 0}
                  combinator={group.combinator}
                  onCombinatorToggle={() => toggleGroupCombinator(group.id)}
                />
              ))}
            </div>

            {/* + Filter button for this group */}
            <button
              onClick={() => handleAddFilter(group.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#2a2a2f] hover:bg-[#f6f6f6] rounded transition-colors mb-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Filter
            </button>
          </div>
        </div>
      ))}

      {/* Action buttons row */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          {/* + Group button - only show when there's at least one complete filter */}
          {hasCompleteFilters() && (
            <button
              onClick={handleAddGroup}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#2a2a2f] hover:bg-[#f6f6f6] rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Group
            </button>
          )}
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 text-sm font-medium text-[#2a2a2f] hover:bg-[#f6f6f6] rounded transition-colors"
          >
            Clear all
          </button>
          <button
            onClick={() => console.log('Save as clicked - to be implemented')}
            className="px-4 py-1.5 text-sm font-medium text-white bg-[#4f44e0] hover:bg-[#3d35c0] rounded-md transition-colors"
          >
            Save as
          </button>
        </div>
      </div>
    </div>
  );
}
