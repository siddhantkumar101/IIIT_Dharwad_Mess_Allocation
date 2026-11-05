import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Loader from '../common/Loader';

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const Overview = () => {
  const [date, setDate] = useState(formatDate(new Date()));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/selections/overview?date=${date}`);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [date]);

  const meals = [
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'snacks', label: 'Evening Snacks' },
    { key: 'dinner', label: 'Dinner' }
  ];

  return (
    <div className="space-y-6">
      {/* Date Filter & Summary */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Dining Overview</h3>
          <p className="text-xs text-slate-500">Live allocation headcounts across mess halls</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700">Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded bg-white font-medium text-slate-700 focus:ring-1 focus:ring-sky-500 shadow-sm"
          />
          <button
            onClick={fetchOverview}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <Loader message="Aggregating dining metrics..." />
      ) : !data ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center text-slate-400 text-xs">
          No selections found for this date
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Mess 1 Total Meals
              </span>
              <div className="text-3xl font-extrabold text-sky-800 mt-1">
                {data.mess1.total}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Student meals assigned</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Mess 2 Total Meals
              </span>
              <div className="text-3xl font-extrabold text-sky-800 mt-1">
                {data.mess2.total}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Student meals assigned</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Skipped Meals
              </span>
              <div className="text-3xl font-extrabold text-slate-600 mt-1">
                {data.skip.total}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Waste prevented in advance</p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Meal-by-Meal Headcount Breakdown
              </h4>
            </div>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/30">
                  <th className="py-2.5 px-4">Meal</th>
                  <th className="py-2.5 px-4 text-center">Mess 1 Count</th>
                  <th className="py-2.5 px-4 text-center">Mess 2 Count</th>
                  <th className="py-2.5 px-4 text-center">Skipped</th>
                  <th className="py-2.5 px-4 text-center font-bold">Total Dining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {meals.map((m) => {
                  const m1 = data.mess1[m.key] || 0;
                  const m2 = data.mess2[m.key] || 0;
                  const skip = data.skip[m.key] || 0;
                  const totalDining = m1 + m2;

                  return (
                    <tr key={m.key} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-semibold text-slate-800">{m.label}</td>
                      <td className="py-3 px-4 text-center text-sky-800 font-bold">{m1}</td>
                      <td className="py-3 px-4 text-center text-sky-800 font-bold">{m2}</td>
                      <td className="py-3 px-4 text-center text-slate-400">{skip}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">{totalDining}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;

