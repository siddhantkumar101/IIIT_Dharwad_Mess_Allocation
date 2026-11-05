import React, { useState } from 'react';
import api from '../../api/axios';

const SurplusForm = ({ isOpen, onClose, mess, date, mealType, onReportSubmitted }) => {
  const [headcountExpected, setHeadcountExpected] = useState('');
  const [headcountServed, setHeadcountServed] = useState('');
  const [surplusQuantityKg, setSurplusQuantityKg] = useState('');
  const [ngoName, setNgoName] = useState('Akshaya Patra');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (Number(surplusQuantityKg) < 0) {
      setError('Surplus quantity cannot be negative');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/surplus', {
        mess,
        date,
        mealType,
        headcountExpected: Number(headcountExpected),
        headcountServed: Number(headcountServed),
        surplusQuantityKg: Number(surplusQuantityKg),
        ngoName: ngoName.trim()
      });

      setSuccess('Surplus report successfully logged for NGO distribution');
      if (onReportSubmitted) onReportSubmitted(res.data.report);

      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit surplus report');
    } finally {
      setLoading(false);
    }
  };

  const mealLabels = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    snacks: 'Evening Snacks',
    dinner: 'Dinner'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Report Leftover Food Surplus
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {mess.toUpperCase()} • {mealLabels[mealType] || mealType} ({date})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded text-xs bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 p-3 rounded text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Portions Prepared (Expected)
              </label>
              <input
                type="number"
                required
                min={0}
                value={headcountExpected}
                onChange={(e) => setHeadcountExpected(e.target.value)}
                placeholder="e.g. 50"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Portions Served
              </label>
              <input
                type="number"
                required
                min={0}
                value={headcountServed}
                onChange={(e) => setHeadcountServed(e.target.value)}
                placeholder="e.g. 48"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Surplus Quantity (kg)
            </label>
            <input
              type="number"
              step="0.1"
              required
              min={0}
              value={surplusQuantityKg}
              onChange={(e) => setSurplusQuantityKg(e.target.value)}
              placeholder="e.g. 2.0"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              NGO Partner Name
            </label>
            <input
              type="text"
              required
              value={ngoName}
              onChange={(e) => setNgoName(e.target.value)}
              placeholder="e.g. Akshaya Patra Foundation"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit to NGO Partner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurplusForm;

