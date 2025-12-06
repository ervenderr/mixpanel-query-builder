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

  // Handle "is set" and "is not set" operators first (work for all types)
  if (rule.operator === 'isSet') {
    return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
  }
  if (rule.operator === 'isNotSet') {
    return fieldValue === null || fieldValue === undefined || fieldValue === '';
  }

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
      case 'notContains':
        return !field.includes(val);
      case 'startsWith':
        return field.startsWith(val);
      case 'endsWith':
        return field.endsWith(val);
      default:
        return false;
    }
  }

  if (typeof fieldValue === 'number') {
    // Handle numeric validation operators
    if (rule.operator === 'isNumeric') {
      return !isNaN(fieldValue);
    }
    if (rule.operator === 'isNotNumeric') {
      return isNaN(fieldValue);
    }

    const num = Number(compareValue);
    if (isNaN(num) && rule.operator !== 'between' && rule.operator !== 'notBetween') {
      return false; // Reject invalid input
    }

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
      case 'between': {
        // Expect value to be "min,max" format
        const [min, max] = String(compareValue).split(',').map(Number);
        if (isNaN(min) || isNaN(max)) return false;
        return fieldValue >= min && fieldValue <= max;
      }
      case 'notBetween': {
        // Expect value to be "min,max" format
        const [min, max] = String(compareValue).split(',').map(Number);
        if (isNaN(min) || isNaN(max)) return false;
        return fieldValue < min || fieldValue > max;
      }
      default:
        return false;
    }
  }

  if (fieldValue instanceof Date) {
    try {
      // Normalize to midnight so time doesn't affect comparison
      // "Created on Dec 1" should match any time on that day
      const userDate = new Date(fieldValue.toDateString());

      switch (rule.operator) {
        case '=': {
          const compareDate = new Date(compareValue);
          if (isNaN(compareDate.getTime())) return false;
          const testDate = new Date(compareDate.toDateString());
          return isEqual(userDate, testDate);
        }
        case '!=': {
          const compareDate = new Date(compareValue);
          if (isNaN(compareDate.getTime())) return false;
          const testDate = new Date(compareDate.toDateString());
          return !isEqual(userDate, testDate);
        }
        case '>': {
          const compareDate = new Date(compareValue);
          if (isNaN(compareDate.getTime())) return false;
          const testDate = new Date(compareDate.toDateString());
          return isAfter(userDate, testDate);
        }
        case '<': {
          const compareDate = new Date(compareValue);
          if (isNaN(compareDate.getTime())) return false;
          const testDate = new Date(compareDate.toDateString());
          return isBefore(userDate, testDate);
        }
        case 'between': {
          // Expect value to be "start,end" format
          const [start, end] = String(compareValue).split(',');
          const startDate = new Date(new Date(start).toDateString());
          const endDate = new Date(new Date(end).toDateString());
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;
          return (isEqual(userDate, startDate) || isAfter(userDate, startDate)) &&
                 (isEqual(userDate, endDate) || isBefore(userDate, endDate));
        }
        case 'notBetween': {
          // Expect value to be "start,end" format
          const [start, end] = String(compareValue).split(',');
          const startDate = new Date(new Date(start).toDateString());
          const endDate = new Date(new Date(end).toDateString());
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;
          return isBefore(userDate, startDate) || isAfter(userDate, endDate);
        }
        case 'last': {
          // Expect value to be "number,unit" format (e.g., "7,days" or "3,months")
          const [amount, unit] = String(compareValue).split(',');
          const num = parseInt(amount, 10);
          if (isNaN(num)) return false;

          const now = new Date(new Date().toDateString());
          const msPerDay = 24 * 60 * 60 * 1000;
          let cutoffDate: Date;

          switch (unit) {
            case 'days':
              cutoffDate = new Date(now.getTime() - num * msPerDay);
              break;
            case 'weeks':
              cutoffDate = new Date(now.getTime() - num * 7 * msPerDay);
              break;
            case 'months':
              cutoffDate = new Date(now);
              cutoffDate.setMonth(cutoffDate.getMonth() - num);
              break;
            case 'years':
              cutoffDate = new Date(now);
              cutoffDate.setFullYear(cutoffDate.getFullYear() - num);
              break;
            default:
              return false;
          }

          return isEqual(userDate, cutoffDate) || isAfter(userDate, cutoffDate);
        }
        case 'notInTheLast': {
          // Opposite of 'last' - user date is NOT in the last X days/weeks/months/years
          const [amount, unit] = String(compareValue).split(',');
          const num = parseInt(amount, 10);
          if (isNaN(num)) return false;

          const now = new Date(new Date().toDateString());
          const msPerDay = 24 * 60 * 60 * 1000;
          let cutoffDate: Date;

          switch (unit) {
            case 'days':
              cutoffDate = new Date(now.getTime() - num * msPerDay);
              break;
            case 'weeks':
              cutoffDate = new Date(now.getTime() - num * 7 * msPerDay);
              break;
            case 'months':
              cutoffDate = new Date(now);
              cutoffDate.setMonth(cutoffDate.getMonth() - num);
              break;
            case 'years':
              cutoffDate = new Date(now);
              cutoffDate.setFullYear(cutoffDate.getFullYear() - num);
              break;
            default:
              return false;
          }

          return isBefore(userDate, cutoffDate);
        }
        case 'beforeTheLast': {
          // Before the last X days/weeks/months/years - same as notInTheLast
          const [amount, unit] = String(compareValue).split(',');
          const num = parseInt(amount, 10);
          if (isNaN(num)) return false;

          const now = new Date(new Date().toDateString());
          const msPerDay = 24 * 60 * 60 * 1000;
          let cutoffDate: Date;

          switch (unit) {
            case 'days':
              cutoffDate = new Date(now.getTime() - num * msPerDay);
              break;
            case 'weeks':
              cutoffDate = new Date(now.getTime() - num * 7 * msPerDay);
              break;
            case 'months':
              cutoffDate = new Date(now);
              cutoffDate.setMonth(cutoffDate.getMonth() - num);
              break;
            case 'years':
              cutoffDate = new Date(now);
              cutoffDate.setFullYear(cutoffDate.getFullYear() - num);
              break;
            default:
              return false;
          }

          return isBefore(userDate, cutoffDate);
        }
        case 'inTheNext': {
          // In the next X days/weeks/months/years - date is between now and now + X
          const [amount, unit] = String(compareValue).split(',');
          const num = parseInt(amount, 10);
          if (isNaN(num)) return false;

          const now = new Date(new Date().toDateString());
          const msPerDay = 24 * 60 * 60 * 1000;
          let futureDate: Date;

          switch (unit) {
            case 'days':
              futureDate = new Date(now.getTime() + num * msPerDay);
              break;
            case 'weeks':
              futureDate = new Date(now.getTime() + num * 7 * msPerDay);
              break;
            case 'months':
              futureDate = new Date(now);
              futureDate.setMonth(futureDate.getMonth() + num);
              break;
            case 'years':
              futureDate = new Date(now);
              futureDate.setFullYear(futureDate.getFullYear() + num);
              break;
            default:
              return false;
          }

          return (isEqual(userDate, now) || isAfter(userDate, now)) &&
                 (isEqual(userDate, futureDate) || isBefore(userDate, futureDate));
        }
        case 'on': {
          // Same as '=' for dates
          const compareDate = new Date(compareValue);
          if (isNaN(compareDate.getTime())) return false;
          const testDate = new Date(compareDate.toDateString());
          return isEqual(userDate, testDate);
        }
        case 'notOn': {
          // Same as '!=' for dates
          const compareDate = new Date(compareValue);
          if (isNaN(compareDate.getTime())) return false;
          const testDate = new Date(compareDate.toDateString());
          return !isEqual(userDate, testDate);
        }
        case 'since': {
          // On or after a specific date
          const compareDate = new Date(compareValue);
          if (isNaN(compareDate.getTime())) return false;
          const testDate = new Date(compareDate.toDateString());
          return isEqual(userDate, testDate) || isAfter(userDate, testDate);
        }
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
