import React, { useState } from "react";
import api from "../../api/axios";

const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

const MenuUpload = () => {
  const [mess, setMess] = useState("mess1");
  const [date, setDate] = useState(formatDate(new Date()));
  const [meals, setMeals] = useState({
    breakfast: "Idli, Sambar, Coconut Chutney, Tea, Coffee",
    lunch: "Roti, Paneer Butter Masala, Dal Tadka, Jeera Rice, Curd, Salad",
    snacks: "Samosa, Mint Chutney, Masala Chai",
    dinner: "Chapati, Veg Biryani, Raita, Mixed Veg Curry, Gulab Jamun",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleMealTextChange = (mealType, text) => {
    setMeals((prev) => ({ ...prev, [mealType]: text }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    // Format meals into array of { type, items: [...] }
    const formattedMeals = Object.entries(meals).map(([type, rawItems]) => ({
      type,
      items: rawItems
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i.length > 0),
    }));

    setLoading(true);
    try {
      const res = await api.post("/menus", {
        mess,
        date,
        meals: formattedMeals,
      });

      setSuccess(
        `Menu for ${mess.toUpperCase()} on ${date} published successfully!`,
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload menu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 max-w-4xl">
      <div className="pb-4 mb-5 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-800">
          Publish Mess Menu
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Define meal offerings for catering vendors and students
        </p>
      </div>

      {success && (
        <div className="mb-4 p-3 rounded text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded text-xs bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Mess Vendor
            </label>
            <select
              value={mess}
              onChange={(e) => setMess(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded bg-white focus:ring-1 focus:ring-sky-500 font-medium"
            >
              <option value="mess1">Mess 1 (North/South Mix)</option>
              <option value="mess2">Mess 2 (Special / Catering)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Menu Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 font-medium"
            />
          </div>
        </div>

        {/* Meal Items Inputs */}
        <div className="space-y-4 pt-2">
          {["breakfast", "lunch", "snacks", "dinner"].map((type) => (
            <div
              key={type}
              className="border border-slate-100 rounded-lg p-3.5 bg-slate-50/50"
            >
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {type} Items
              </label>
              <input
                type="text"
                required
                value={meals[type]}
                onChange={(e) => handleMealTextChange(type, e.target.value)}
                placeholder="Separate items with commas (e.g. Roti, Paneer Butter Masala, Dal)"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded bg-white focus:ring-1 focus:ring-sky-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Comma-separated items will be parsed automatically
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded shadow-sm disabled:opacity-50 transition-colors"
          >
            {loading ? "Publishing Menu..." : "Publish Menu to Portal"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MenuUpload;
