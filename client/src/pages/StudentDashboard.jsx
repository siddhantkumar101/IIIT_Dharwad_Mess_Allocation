import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import MenuView from '../components/student/MenuView';
import MealSelector from '../components/student/MealSelector';
import api from '../api/axios';

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const getTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatDate(d);
};

const getToday = () => {
  return formatDate(new Date());
};

const StudentDashboard = () => {
  const todayStr = getToday();
  const tomorrowStr = getTomorrow();

  // Menu viewing date toggle (Today or Tomorrow)
  const [viewingMenuDate, setViewingMenuDate] = useState(tomorrowStr);
  const [menus, setMenus] = useState({ mess1: null, mess2: null });
  const [loadingMenus, setLoadingMenus] = useState(true);

  // Live real-time clock ticker
  const [currentTime, setCurrentTime] = useState(new Date());

  // Countdown state down to 12:00 AM Midnight
  const [timeRemainingText, setTimeRemainingText] = useState('');
  const [isWindowClosed, setIsWindowClosed] = useState(false);

  // Live timer & 12:00 Midnight countdown calculation
  useEffect(() => {
    const updateTimeAndCountdown = () => {
      const now = new Date();
      setCurrentTime(now);

      // Midnight cutoff: 23:59:59 tonight
      const cutoff = new Date();
      cutoff.setHours(23, 59, 59, 999);

      const diff = cutoff.getTime() - now.getTime();

      if (diff <= 0) {
        setIsWindowClosed(true);
        setTimeRemainingText('Window closed for tomorrow (12:00 Midnight)');
      } else {
        setIsWindowClosed(false);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeRemainingText(
          `Cutoff in: ${hours}h ${minutes}m ${seconds}s (12:00 AM Midnight)`
        );
      }
    };

    updateTimeAndCountdown();
    const interval = setInterval(updateTimeAndCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch menus for currently selected menu date
  const fetchMenus = async (targetDate) => {
    setLoadingMenus(true);
    try {
      const res = await api.get(`/menus?date=${targetDate}`);
      const list = res.data || [];
      const m1 = list.find((m) => m.mess === 'mess1') || null;
      const m2 = list.find((m) => m.mess === 'mess2') || null;
      setMenus({ mess1: m1, mess2: m2 });
    } catch (err) {
      console.error('Error fetching menus:', err);
    } finally {
      setLoadingMenus(false);
    }
  };

  useEffect(() => {
    fetchMenus(viewingMenuDate);
  }, [viewingMenuDate]);

  const liveDateString = currentTime.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const liveTimeString = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Real-time Header & Date Information Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-lg font-bold text-slate-900">Student Mess Allocation</h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
              <span>Today: <strong className="text-slate-800">{liveDateString}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Live Time: <strong className="text-slate-900 font-mono">{liveTimeString}</strong></span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-left sm:text-right">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Booking Open For
              </span>
              <span className="text-sm font-bold text-sky-800">
                Tomorrow ({tomorrowStr})
              </span>
            </div>
          </div>
        </div>

        {/* Meal Selection Form (For Tomorrow Only) */}
        <div className="mb-10">
          <MealSelector
            targetDate={tomorrowStr}
            isWindowClosed={isWindowClosed}
            timeRemainingText={timeRemainingText}
            onSelectionSaved={() => fetchMenus(viewingMenuDate)}
          />
        </div>

        {/* Catering Menus Preview */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-200 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                Mess Catering Menus
              </h3>
              <p className="text-xs text-slate-500">
                Compare menu offerings between Mess 1 and Mess 2
              </p>
            </div>

            {/* Menu Date Toggle */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewingMenuDate(todayStr)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  viewingMenuDate === todayStr
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Today's Menu ({todayStr})
              </button>
              <button
                type="button"
                onClick={() => setViewingMenuDate(tomorrowStr)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  viewingMenuDate === tomorrowStr
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tomorrow's Menu ({tomorrowStr})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MenuView
              messNumber="mess1"
              menuData={menus.mess1}
              loading={loadingMenus}
            />
            <MenuView
              messNumber="mess2"
              menuData={menus.mess2}
              loading={loadingMenus}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
