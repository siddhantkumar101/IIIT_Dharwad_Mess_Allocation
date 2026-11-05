import React, { useState } from 'react';
import api from '../../api/axios';
import Loader from '../common/Loader';

// Updated exact timings as requested
const MEALS = [
  { id: 'breakfast', label: 'Breakfast', timing: '07:30 AM - 09:00 AM' },
  { id: 'lunch', label: 'Lunch', timing: '12:30 PM - 02:00 PM' },
  { id: 'snacks', label: 'Evening Snacks', timing: '04:30 PM - 05:30 PM' },
  { id: 'dinner', label: 'Dinner', timing: '07:30 PM - 09:00 PM' }
];

const MAX_CAPACITY = 750;

const HeadcountView = ({ mess, date, headcountData, onOpenSurplusModal }) => {
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [studentLists, setStudentLists] = useState({});
  const [loadingList, setLoadingList] = useState({});

  const toggleStudentList = async (mealId) => {
    if (expandedMeal === mealId) {
      setExpandedMeal(null);
      return;
    }

    setExpandedMeal(mealId);

    // Fetch named student list
    if (!studentLists[mealId]) {
      setLoadingList((prev) => ({ ...prev, [mealId]: true }));
      try {
        const res = await api.get(`/selections/list?mess=${mess}&date=${date}&meal=${mealId}`);
        setStudentLists((prev) => ({ ...prev, [mealId]: res.data || [] }));
      } catch (err) {
        console.error('Error fetching student list:', err);
      } finally {
        setLoadingList((prev) => ({ ...prev, [mealId]: false }));
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {MEALS.map((meal) => {
        const count = headcountData[meal.id] || 0;
        const isExpanded = expandedMeal === meal.id;
        const students = studentLists[meal.id] || [];
        const isLoadingList = loadingList[meal.id];
        const isFull = count >= MAX_CAPACITY;

        return (
          <div
            key={meal.id}
            className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col justify-between overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-800">{meal.label}</h4>
                  <p className="text-xs font-semibold text-sky-700 mt-0.5">{meal.timing}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Seating: <strong className={isFull ? 'text-red-600' : 'text-slate-600'}>{count} / {MAX_CAPACITY}</strong>
                    {isFull && <span className="ml-1 text-red-600 font-bold">(Capacity Reached)</span>}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-sky-800 leading-none">
                    {count}
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mt-1">
                    Total Expected
                  </span>
                </div>
              </div>

              {/* Student list toggle & Surplus button */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleStudentList(meal.id)}
                  className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{isExpanded ? 'Hide Student Roster' : `View Student List (${count})`}</span>
                  <span className="text-[10px]">{isExpanded ? '▲' : '▼'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenSurplusModal(meal.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors cursor-pointer"
                >
                  Report Surplus
                </button>
              </div>

              {/* Expandable Named Student List */}
              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  {isLoadingList ? (
                    <Loader message="Loading student roster..." />
                  ) : students.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2 text-center">
                      No students allocated yet for this meal
                    </p>
                  ) : (
                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                      {students.map((student, idx) => (
                        <div
                          key={student._id || idx}
                          className="flex items-center justify-between text-xs p-2.5 rounded bg-slate-50 border border-slate-100"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">{student.name}</span>
                            <span className="ml-2 text-[11px] text-slate-500">
                              {student.rollNumber || student.email}
                            </span>
                            <span className="ml-2 text-[10px] text-slate-400 capitalize">
                              ({student.hostel} hostel)
                            </span>
                          </div>

                          <div>
                            {student.isDefaultAllocation ? (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                                Default Allocation
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                                Student Choice
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HeadcountView;
