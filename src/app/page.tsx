'use client';

import { useState, useCallback } from 'react';
import type { RuleGroupType } from 'react-querybuilder';
import QueryBuilder from '@/components/QueryBuilder';
import DataTable from '@/components/DataTable';
import { dummyUsers } from '@/lib/dummyData';
import { applyFilters } from '@/lib/filterLogic';

export default function Home() {
  const [filteredUsers, setFilteredUsers] = useState(dummyUsers);

  const handleQueryChange = useCallback((query: RuleGroupType) => {
    const results = applyFilters(dummyUsers, query);
    setFilteredUsers(results);
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#2a2a2f] mb-2">Users</h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[#626266]">
              <span className="font-medium text-[#2a2a2f]">{filteredUsers.length.toLocaleString()}</span>
              <span>Users with Profiles</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#626266] hover:bg-[#f6f6f6] rounded-md transition-colors border border-[#e9e9e9]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Hide Filter
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#626266] hover:bg-[#f6f6f6] rounded-md transition-colors border border-[#e9e9e9]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Columns · 7
              </button>
            </div>
          </div>
        </div>

        {/* Query Builder Card */}
        <div className="bg-white rounded-lg border border-[#e9e9e9] p-6 mb-6">
          <QueryBuilder onQueryChange={handleQueryChange} />
        </div>

        {/* Results Table */}
        <DataTable users={filteredUsers} totalCount={dummyUsers.length} />
      </div>
    </main>
  );
}
