import type { RuleGroupType } from 'react-querybuilder';
import type { User } from '@/types';
import { isAfter, isBefore, isEqual } from 'date-fns';

// Custom filter logic instead of react-querybuilder's default
// More control over exact behavior and better performance for our use case
export function applyFilters(users: User[], query: RuleGroupType): User[] {
  if (!query.rules || query.rules.length === 0) {
    return users;
  }

  return users.filter((user) => evaluateGroup(user, query));
}

// Recursively evaluate rule groups (supports nested groups)
// Currently just using AND but structure supports OR too
function evaluateGroup(user: User, group: RuleGroupType): boolean {
  const results = group.rules.map((rule) => {
    if ('rules' in rule) {
      return evaluateGroup(user, rule as RuleGroupType);
    }
    return evaluateRule(user, rule);
  });

  return group.combinator === 'and'
    ? results.every((r) => r)
    : results.some((r) => r);
}

// Type detection at runtime using typeof checks
// Simpler than looking up field metadata on every comparison
function evaluateRule(user: User, rule: any): boolean {
  const fieldValue = user[rule.field as keyof User];
  const compareValue = rule.value;

  // String comparisons - case insensitive
  if (typeof fieldValue === 'string') {
    const field = String(fieldValue).toLowerCase();
    const val = String(compareValue).toLowerCase();

    switch (rule.operator) {
      case '=':
        return field === val;
      case '!=':
        return field !== val;
      case 'contains':
        return field.includes(val);
      case 'doesNotContain':
        return !field.includes(val);
      default:
        return false;
    }
  }

  if (typeof fieldValue === 'number') {
    const num = Number(compareValue);
    if (isNaN(num)) return false; // Reject invalid input

    switch (rule.operator) {
      case '=':
        return fieldValue === num;
      case '!=':
        return fieldValue !== num;
      case '>':
        return fieldValue > num;
      case '<':
        return fieldValue < num;
      case '>=':
        return fieldValue >= num;
      case '<=':
        return fieldValue <= num;
      default:
        return false;
    }
  }

  if (fieldValue instanceof Date) {
    try {
      const compareDate = new Date(compareValue);
      if (isNaN(compareDate.getTime())) return false;

      // Normalize to midnight so time doesn't affect comparison
      // "Created on Dec 1" should match any time on that day
      const userDate = new Date(fieldValue.toDateString());
      const testDate = new Date(compareDate.toDateString());

      switch (rule.operator) {
        case '=':
          return isEqual(userDate, testDate);
        case '!=':
          return !isEqual(userDate, testDate);
        case '>':
          return isAfter(userDate, testDate);
        case '<':
          return isBefore(userDate, testDate);
        default:
          return false;
      }
    } catch {
      // Catch invalid date strings silently
      return false;
    }
  }

  // Unknown field type - fail safe
  return false;
}
