'use client';

import type { User } from '@/types';
import { format } from 'date-fns';

interface DataTableProps {
  users: User[];
  totalCount: number;
}

// Clean table showing filtered results
// Using Mixpanel's exact color palette
export default function DataTable({ users, totalCount }: DataTableProps) {
  return (
    <div className="bg-white rounded-lg border border-[#e9e9e9] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#e9e9e9]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-light text-[#2a2a2f]">
            Users
          </h3>
          <span className="text-sm font-light text-[#8f8f91]">
            {users.length} of {totalCount} users
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#e9e9e9]">
          <thead className="bg-[#f6f6f6]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-light text-[#626266] uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-light text-[#626266] uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-light text-[#626266] uppercase tracking-wider">
                Employees
              </th>
              <th className="px-6 py-3 text-left text-xs font-light text-[#626266] uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-light text-[#626266] uppercase tracking-wider">
                Last Seen
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#e9e9e9]">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-sm font-light text-[#8f8f91]"
                >
                  No users match the current filters
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-[#fafbfd]">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-[#2a2a2f]">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-[#8f8f91]">
                    {user.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-[#8f8f91]">
                    {user.employees}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-[#8f8f91]">
                    {format(user.created, 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-[#8f8f91]">
                    {format(user.lastSeen, 'MMM d, yyyy')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
