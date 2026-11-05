import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Loader from '../common/Loader';

const SurplusHistory = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterMess, setFilterMess] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterMeal, setFilterMeal] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterMess) params.append('mess', filterMess);
      if (filterDate) params.append('date', filterDate);
      if (filterMeal) params.append('mealType', filterMeal);

      const res = await api.get(`/surplus?${params.toString()}`);
      setReports(res.data || []);
    } catch (err) {
      console.error('Error fetching surplus reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filterMess, filterDate, filterMeal]);

  const clearFilters = () => {
    setFilterMess('');
    setFilterDate('');
    setFilterMeal('');
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">NGO Food Surplus Log</h3>
            <p className="text-xs text-slate-500">
              Verified records of leftover food routed to partner NGOs
            </p>
          </div>
          {(filterMess || filterDate || filterMeal) && (
            <button
              onClick={clearFilters}
              className="text-xs text-sky-700 hover:text-sky-900 font-medium self-start sm:self-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Mess
            </label>
            <select
              value={filterMess}
              onChange={(e) => setFilterMess(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
            >
              <option value="">All Messes</option>
              <option value="mess1">Mess 1</option>
              <option value="mess2">Mess 2</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Date
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Meal Type
            </label>
            <select
              value={filterMeal}
              onChange={(e) => setFilterMeal(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
            >
              <option value="">All Meals</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="snacks">Snacks</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <Loader message="Loading surplus records..." />
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No surplus reports found matching filters
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Mess</th>
                  <th className="py-3 px-4">Meal</th>
                  <th className="py-3 px-4 text-center">Prepared</th>
                  <th className="py-3 px-4 text-center">Served</th>
                  <th className="py-3 px-4 text-center">Surplus (kg)</th>
                  <th className="py-3 px-4">NGO Partner</th>
                  <th className="py-3 px-4">Reported By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium text-slate-800">{r.date}</td>
                    <td className="py-3 px-4">
                      <span className="uppercase font-semibold text-[10px] px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100">
                        {r.mess}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-700 font-medium">
                      {r.mealType}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-700">{r.headcountExpected}</td>
                    <td className="py-3 px-4 text-center text-slate-700">{r.headcountServed}</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700">
                      {r.surplusQuantityKg} kg
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {r.ngoName || 'Akshaya Patra'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {r.reportedBy?.name || 'Mess Manager'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurplusHistory;

