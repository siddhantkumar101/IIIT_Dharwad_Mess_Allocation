import React from 'react';

const mealTitles = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  snacks: 'Evening Snacks',
  dinner: 'Dinner'
};

const MenuView = ({ messNumber, menuData, loading }) => {
  const messTitle = messNumber === 'mess1' ? 'Mess 1 (North/South Mix)' : 'Mess 2 (Special / Catering)';

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-slate-100 rounded"></div>
          <div className="h-12 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-full">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            {messNumber === 'mess1' ? 'Mess 1' : 'Mess 2'} Menu
          </h3>
          <p className="text-[11px] text-slate-500">{messTitle}</p>
        </div>
        <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100">
          {messNumber.toUpperCase()}
        </span>
      </div>

      <div className="p-5 flex-1 divide-y divide-slate-100">
        {!menuData || !menuData.meals || menuData.meals.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No menu uploaded for this date yet
          </div>
        ) : (
          mealTypes.map((type) => {
            const mealItem = menuData.meals.find((m) => m.type === type);
            return (
              <div key={type} className="py-3 first:pt-0 last:pb-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {mealTitles[type]}
                </span>
                <div className="mt-1">
                  {mealItem && mealItem.items && mealItem.items.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {mealItem.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Menu items not listed</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MenuView;

