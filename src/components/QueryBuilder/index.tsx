'use client';

import { useState, useCallback } from 'react';
import type { RuleGroupType, RuleType } from 'react-querybuilder';
import FilterRow from './FilterRow';

interface QueryBuilderProps {
  onQueryChange: (query: RuleGroupType) => void;
}

interface FilterGroup {
  id: string;
  filters: RuleType[];
}

// Using react-querybuilder types but custom UI components to match Mixpanel exactly
// State is an array of groups, each containing filters - parent gets notified on changes
export default function QueryBuilder({ onQueryChange }: QueryBuilderProps) {
  // Start with one group containing one empty filter row (Mixpanel does this too)
  const [groups, setGroups] = useState<FilterGroup[]>([
    {
      id: crypto.randomUUID(),
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

  // Filter out incomplete rules (missing field/operator/value)
  // Lets users gradually fill in a row without breaking the query
  // Some operators don't require a value (isSet, isNotSet, isNumeric, isNotNumeric)
  const buildQuery = useCallback((currentGroups: FilterGroup[], currentCombinator: 'and' | 'or'): RuleGroupType => {
    const operatorsWithoutValue = ['isSet', 'isNotSet', 'isNumeric', 'isNotNumeric'];

    // Build nested groups
    const groupRules = currentGroups.map((group) => ({
      combinator: 'and' as const, // Within a group, filters are combined with AND
      rules: group.filters.filter((f) => {
        if (!f.field || !f.operator) return false;
        // If operator doesn't require value, it's complete
        if (operatorsWithoutValue.includes(f.operator as string)) return true;
        // Otherwise, value must be present
        return f.value !== undefined && f.value !== '';
      }),
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
  }, []);

  // Single update point - keeps local state and parent callback in sync
  const updateQuery = useCallback((newGroups: FilterGroup[]) => {
    setGroups(newGroups);
    onQueryChange(buildQuery(newGroups, combinator));
  }, [buildQuery, onQueryChange, combinator]);

  // Handle combinator toggle
  const toggleCombinator = useCallback(() => {
    const newCombinator = combinator === 'and' ? 'or' : 'and';
    setCombinator(newCombinator);
    onQueryChange(buildQuery(groups, newCombinator));
  }, [combinator, groups, buildQuery, onQueryChange]);

  // Reset operator and value when field changes
  // Different field types have different valid operators
  const handleFieldChange = useCallback((groupId: string, filterId: string, field: string) => {
    const newGroups = groups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            filters: group.filters.map((f) =>
              f.id === filterId ? { ...f, field, operator: '', value: '' } : f
            ),
          }
        : group
    );
    updateQuery(newGroups);
  }, [groups, updateQuery]);

  const handleOperatorChange = useCallback((groupId: string, filterId: string, operator: string) => {
    const newGroups = groups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            filters: group.filters.map((f) =>
              f.id === filterId ? { ...f, operator, value: '' } : f
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

  return (
    <div className="relative">
      {groups.map((group, groupIndex) => (
        <div key={group.id}>
          {/* AND/OR button between groups */}
          {groupIndex > 0 && (
            <div className="flex justify-center my-4">
              <button
                onClick={toggleCombinator}
                className="px-4 py-1.5 text-sm font-medium text-white bg-[#4f44e0] hover:bg-[#3d35c0] rounded-md transition-colors uppercase"
              >
                {combinator}
              </button>
            </div>
          )}

          {/* ALL USERS group label */}
          <div className="flex items-center gap-2 mb-4 text-xs text-[#8f8f91] uppercase tracking-wider font-medium">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            ALL USERS
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
                combinator="and"
                onCombinatorToggle={() => {}}
              />
            ))}
          </div>

          {/* + Filter button for this group */}
          <button
            onClick={() => handleAddFilter(group.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#2a2a2f] hover:bg-[#f6f6f6] rounded-md transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Filter
          </button>
        </div>
      ))}

      {/* Action buttons row */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          {/* + Group button */}
          <button
            onClick={handleAddGroup}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#2a2a2f] hover:bg-[#f6f6f6] rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Group
          </button>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 text-sm font-medium text-[#2a2a2f] hover:bg-[#f6f6f6] rounded-md transition-colors"
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
