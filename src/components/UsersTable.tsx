'use client';

import type { User } from '@/types';
import { format } from 'date-fns';

interface UsersTableProps {
  users: User[];
  totalCount: number; // Total before filtering
}

// Simple table showing filtered users
// Matches Mixpanel's clean table design
export default function UsersTable({ users, totalCount }: UsersTableProps) {
  return (
    <div className="mt-8">
      {/* Header with count */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-light text-[#2a2a2f]">
          Users {users.length !== totalCount && `(${users.length} of ${totalCount})`}
        </h2>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-sm font-light text-[#2a2a2f] hover:bg-[#f6f6f6] rounded-md transition-colors">
            Hide Filter
          </button>
          <button className="px-3 py-1.5 text-sm font-light text-[#2a2a2f] hover:bg-[#f6f6f6] rounded-md transition-colors">
            Edit Columns
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#e9e9e9] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#f6f6f6] border-b border-[#e9e9e9]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-light text-[#626266] uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-light text-[#626266] uppercase tracking-wider">
                Company
              </th>
              <th className="px-4 py-3 text-left text-xs font-light text-[#626266] uppercase tracking-wider">
                Employees
              </th>
              <th className="px-4 py-3 text-left text-xs font-light text-[#626266] uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-light text-[#626266] uppercase tracking-wider">
                Last Seen
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#e9e9e9]">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm font-light text-[#8f8f91]">
                  No users match the current filters
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-[#fafbfd] transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-light text-[#2a2a2f]">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 text-sm font-light text-[#2a2a2f]">
                    {user.company}
                  </td>
                  <td className="px-4 py-3 text-sm font-light text-[#2a2a2f]">
                    {user.employees}
                  </td>
                  <td className="px-4 py-3 text-sm font-light text-[#8f8f91]">
                    {format(user.created, 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3 text-sm font-light text-[#8f8f91]">
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
