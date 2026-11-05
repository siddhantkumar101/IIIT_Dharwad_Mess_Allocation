import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

// Updated exact timings as requested
const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', time: '07:30 AM - 09:00 AM' },
  { id: 'lunch', label: 'Lunch', time: '12:30 PM - 02:00 PM' },
  { id: 'snacks', label: 'Evening Snacks', time: '04:30 PM - 05:30 PM' },
  { id: 'dinner', label: 'Dinner', time: '07:30 PM - 09:00 PM' }
];

const MealSelector = ({ targetDate, isWindowClosed, timeRemainingText, onSelectionSaved }) => {
  const { user } = useAuth();

  // Default allocation rule: Boys -> Mess 1, Girls -> Mess 2
  const defaultMessForHostel = user?.hostel === 'girls' ? 'mess2' : 'mess1';
  const defaultHostelChoices = {
    breakfast: defaultMessForHostel,
    lunch: defaultMessForHostel,
    snacks: defaultMessForHostel,
    dinner: defaultMessForHostel
  };

  const [selections, setSelections] = useState(defaultHostelChoices);
  const [savedSelections, setSavedSelections] = useState(defaultHostelChoices);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Seat Availability state (Capacity: 750)
  const [availability, setAvailability] = useState({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch seat availability and existing user selections for target date
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch availability (750 cap)
        const availRes = await api.get(`/selections/availability?date=${targetDate}`);
        if (isMounted && availRes.data && availRes.data.meals) {
          setAvailability(availRes.data.meals);
        }

        // Fetch own existing selections
        const myRes = await api.get(`/selections/my?date=${targetDate}`);
        if (isMounted && myRes.data && myRes.data.selections && myRes.data.selections.length > 0) {
          const mapped = {};
          myRes.data.selections.forEach((s) => {
            mapped[s.mealType] = s.choice;
          });
          setSelections(mapped);
          setSavedSelections(mapped);
          setHasSubmitted(true);
          setSubmittedAt(myRes.data.submittedAt);
          setIsEditing(false); // default to locked submitted view
        } else if (isMounted) {
          // Pre-populate with default hostel assignment
          setSelections(defaultHostelChoices);
          setSavedSelections(defaultHostelChoices);
          setHasSubmitted(false);
          setSubmittedAt(null);
          setIsEditing(true); // new submission view
        }
      } catch (err) {
        console.error('Failed to load selections or availability:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [targetDate, user?.hostel]);

  const handleChoiceChange = (mealType, choice) => {
    if (isWindowClosed || (!isEditing && hasSubmitted)) return;

    // Check if the chosen mess is full (750 capacity)
    const mealAvail = availability[mealType];
    if (mealAvail && mealAvail[`${choice}Full`]) {
      const altMess = choice === 'mess1' ? 'Mess 2' : 'Mess 1';
      setError(`${choice === 'mess1' ? 'Mess 1' : 'Mess 2'} is full (750/750 seats filled). Please select ${altMess} or Skip.`);
      return;
    }

    setError('');
    setSelections((prev) => ({
      ...prev,
      [mealType]: choice
    }));
  };

  const handleStartEdit = () => {
    setError('');
    setMessage('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setSelections(savedSelections);
    setIsEditing(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isWindowClosed) {
      setError('Selection deadline has passed. Window closes at 12:00 Midnight.');
      return;
    }

    // Validate that none of the chosen messes are full
    for (const meal of MEAL_TYPES) {
      const choice = selections[meal.id];
      const mealAvail = availability[meal.id];
      if (mealAvail && mealAvail[`${choice}Full`]) {
        const messName = choice === 'mess1' ? 'Mess 1' : 'Mess 2';
        const altMess = choice === 'mess1' ? 'Mess 2' : 'Mess 1';
        setError(`${messName} is full (750/750) for ${meal.label}. Please select ${altMess} or Skip before confirming.`);
        return;
      }
    }

    setSaving(true);
    setMessage('');
    setError('');

    const formattedSelections = MEAL_TYPES.map((m) => ({
      mealType: m.id,
      choice: selections[m.id] || 'skip'
    }));

    try {
      const res = await api.post('/selections', {
        date: targetDate,
        selections: formattedSelections
      });

      const updated = res.data.selection;
      setSavedSelections(selections);
      setHasSubmitted(true);
      setSubmittedAt(updated.submittedAt || new Date());
      setIsEditing(false);

      setMessage(
        res.data.isUpdate
          ? 'Your selections have been successfully updated!'
          : 'Your selections have been confirmed and recorded!'
      );

      // Refresh availability
      const availRes = await api.get(`/selections/availability?date=${targetDate}`);
      if (availRes.data && availRes.data.meals) {
        setAvailability(availRes.data.meals);
      }

      if (onSelectionSaved) onSelectionSaved(updated);
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit meal selections');
    } finally {
      setSaving(false);
    }
  };

  const isFormLocked = isWindowClosed || (!isEditing && hasSubmitted);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
      {/* Title & Live Cutoff Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-slate-900">
              Meal Selection for Tomorrow ({targetDate})
            </h3>
            {hasSubmitted && !isEditing && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                <span>✓</span> Submitted
              </span>
            )}
            {hasSubmitted && isEditing && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                <span>✎</span> Editing Mode
              </span>
            )}
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Capacity: 750 seats / mess
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-1">
            Default allocation: <strong>{user?.hostel === 'girls' ? 'Girls Hostel → Mess 2' : 'Boys Hostel → Mess 1'}</strong> (if unselected). You can customize choices before 12:00 Midnight.
          </p>
        </div>

        {/* Live Countdown Badge */}
        <div
          className={`px-3 py-1.5 rounded text-xs font-semibold border flex items-center gap-2 self-start sm:self-auto ${
            isWindowClosed
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-sky-50 text-sky-800 border-sky-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full animate-pulse bg-current"></span>
          <span>{timeRemainingText}</span>
        </div>
      </div>

      {/* Editing / Submitted Notice Banner */}
      {hasSubmitted && !isEditing && (
        <div className="mt-4 p-3.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="font-semibold text-emerald-950 flex items-center gap-1.5">
              <span>✅</span> Your meal allocation for tomorrow is confirmed.
            </p>
            {submittedAt && (
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Last recorded: {new Date(submittedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
              </p>
            )}
          </div>
          {!isWindowClosed && (
            <button
              type="button"
              onClick={handleStartEdit}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              ✏️ Edit Selections
            </button>
          )}
        </div>
      )}

      {hasSubmitted && isEditing && (
        <div className="mt-4 p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="font-semibold text-amber-950 flex items-center gap-1.5">
              <span>⚠️</span> Editing Mode Active: You are modifying your existing meal selections.
            </p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Make changes below and click <strong>"Update Selections"</strong> to save, or cancel to keep your current selections.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors cursor-pointer self-start sm:self-auto"
          >
            Cancel Edit
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded text-xs bg-red-50 text-red-700 border border-red-200 font-semibold">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-4 p-3 rounded text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Meal Slot & Timing</th>
                <th className="py-2.5 px-3 text-center">Mess 1 (North/South)</th>
                <th className="py-2.5 px-3 text-center">Mess 2 (Special)</th>
                <th className="py-2.5 px-3 text-center">Skip Meal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MEAL_TYPES.map((meal) => {
                const currentChoice = selections[meal.id];
                const mealAvail = availability[meal.id] || { mess1: 0, mess2: 0, mess1Full: false, mess2Full: false };
                const isM1Full = mealAvail.mess1Full;
                const isM2Full = mealAvail.mess2Full;

                return (
                  <tr
                    key={meal.id}
                    className={`transition-colors ${
                      isFormLocked ? 'bg-slate-50/40' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800 text-sm">{meal.label}</div>
                      <div className="text-[11px] font-medium text-sky-700 mt-0.5">{meal.time}</div>
                    </td>

                    {/* Mess 1 Option */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center">
                        <label className={`inline-flex items-center justify-center p-2 rounded ${
                          isFormLocked || isM1Full ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-slate-100/60'
                        }`}>
                          <input
                            type="radio"
                            name={`meal-${meal.id}`}
                            value="mess1"
                            checked={currentChoice === 'mess1'}
                            disabled={isFormLocked || loading || isM1Full}
                            onChange={() => handleChoiceChange(meal.id, 'mess1')}
                            className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                          />
                        </label>
                        <span className={`text-[10px] font-medium mt-0.5 ${
                          isM1Full ? 'text-red-600 font-bold' : 'text-slate-400'
                        }`}>
                          {isM1Full ? 'Full (750/750)' : `${mealAvail.mess1}/750`}
                        </span>
                      </div>
                    </td>

                    {/* Mess 2 Option */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center">
                        <label className={`inline-flex items-center justify-center p-2 rounded ${
                          isFormLocked || isM2Full ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-slate-100/60'
                        }`}>
                          <input
                            type="radio"
                            name={`meal-${meal.id}`}
                            value="mess2"
                            checked={currentChoice === 'mess2'}
                            disabled={isFormLocked || loading || isM2Full}
                            onChange={() => handleChoiceChange(meal.id, 'mess2')}
                            className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                          />
                        </label>
                        <span className={`text-[10px] font-medium mt-0.5 ${
                          isM2Full ? 'text-red-600 font-bold' : 'text-slate-400'
                        }`}>
                          {isM2Full ? 'Full (750/750)' : `${mealAvail.mess2}/750`}
                        </span>
                      </div>
                    </td>

                    {/* Skip Option */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center">
                        <label className={`inline-flex items-center justify-center p-2 rounded ${
                          isFormLocked ? 'cursor-default' : 'cursor-pointer hover:bg-slate-100/60'
                        }`}>
                          <input
                            type="radio"
                            name={`meal-${meal.id}`}
                            value="skip"
                            checked={currentChoice === 'skip'}
                            disabled={isFormLocked || loading}
                            onChange={() => handleChoiceChange(meal.id, 'skip')}
                            className="w-4 h-4 text-slate-500 focus:ring-slate-400 border-slate-300"
                          />
                        </label>
                        <span className="text-[10px] text-slate-400 mt-0.5">Skip</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Button Row */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <p className="text-[11px] text-slate-500">
            {isWindowClosed
              ? 'Selection window closed for tonight (Cutoff was 12:00 Midnight).'
              : hasSubmitted && !isEditing
              ? 'Choices are locked. Click "Edit Selections" to modify.'
              : 'You can change selections anytime before 12:00 Midnight tonight.'}
          </p>

          <div className="flex items-center gap-2">
            {hasSubmitted && isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            {(!hasSubmitted || isEditing) && (
              <button
                type="submit"
                disabled={isWindowClosed || saving || loading}
                className="px-5 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {saving
                  ? 'Saving...'
                  : hasSubmitted
                  ? 'Update Selections'
                  : 'Confirm & Submit Selections'}
              </button>
            )}

            {hasSubmitted && !isEditing && !isWindowClosed && (
              <button
                type="button"
                onClick={handleStartEdit}
                className="px-5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded shadow-xs transition-colors cursor-pointer"
              >
                ✏️ Edit Selections
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default MealSelector;
