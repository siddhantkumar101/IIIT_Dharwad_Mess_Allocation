import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import HeadcountView from '../components/mess/HeadcountView';
import SurplusForm from '../components/mess/SurplusForm';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Loader from '../components/common/Loader';

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const MessDashboard = ({ forcedMess }) => {
  const { user } = useAuth();
  const currentMess = forcedMess || (user?.role === 'mess2' ? 'mess2' : 'mess1');
  const messTitle = currentMess === 'mess1' ? 'Mess 1 (Catering Team)' : 'Mess 2 (Catering Team)';

  const todayStr = formatDate(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [headcount, setHeadcount] = useState({
    breakfast: 0,
    lunch: 0,
    snacks: 0,
    dinner: 0
  });
  const [loading, setLoading] = useState(true);

  // Surplus Modal state
  const [isSurplusModalOpen, setIsSurplusModalOpen] = useState(false);
  const [selectedMealForSurplus, setSelectedMealForSurplus] = useState('breakfast');

  const fetchHeadcount = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/selections/headcount?mess=${currentMess}&date=${selectedDate}`);
      if (res.data && res.data.summary) {
        setHeadcount(res.data.summary);
      }
    } catch (err) {
      console.error('Error fetching headcount:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeadcount();
  }, [currentMess, selectedDate]);

  const handleOpenSurplus = (mealType) => {
    setSelectedMealForSurplus(mealType);
    setIsSurplusModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Header & Date Picker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                {currentMess.toUpperCase()}
              </span>
              <h2 className="text-xl font-bold text-slate-900">{messTitle}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live Headcount Forecast & Surplus Food Logging
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700">Filter Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded bg-white font-medium text-slate-700 focus:ring-1 focus:ring-sky-500 shadow-sm"
            />
            <button
              onClick={fetchHeadcount}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors shadow-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Headcount Cards */}
        {loading ? (
          <Loader message="Aggregating dining headcounts from database..." />
        ) : (
          <HeadcountView
            mess={currentMess}
            date={selectedDate}
            headcountData={headcount}
            onOpenSurplusModal={handleOpenSurplus}
          />
        )}
      </main>

      {/* Surplus Submission Modal */}
      <SurplusForm
        isOpen={isSurplusModalOpen}
        onClose={() => setIsSurplusModalOpen(false)}
        mess={currentMess}
        date={selectedDate}
        mealType={selectedMealForSurplus}
        onReportSubmitted={() => {
          fetchHeadcount();
        }}
      />
    </div>
  );
};

export default MessDashboard;

