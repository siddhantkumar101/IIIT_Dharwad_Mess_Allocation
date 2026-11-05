import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import MenuUpload from '../components/admin/MenuUpload';
import Overview from '../components/admin/Overview';
import SurplusHistory from '../components/admin/SurplusHistory';
import UserList from '../components/admin/UserList';

const tabs = [
  { id: 'menu', label: 'Menu Upload' },
  { id: 'overview', label: 'Overview & Allocations' },
  { id: 'surplus', label: 'Surplus History' },
  { id: 'users', label: 'Registered Students' }
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('menu');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Dashboard Title & Tabs */}
        <div className="pb-6 mb-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Administrator Console</h2>
          <p className="text-xs text-slate-500 mt-1">
            System administration, catering menu management, and waste reduction tracking
          </p>

          <div className="flex border-b border-slate-200 mt-6 gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-xs font-semibold tracking-wide border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-sky-700 text-sky-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Panels */}
        <div>
          {activeTab === 'menu' && <MenuUpload />}
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'surplus' && <SurplusHistory />}
          {activeTab === 'users' && <UserList />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

