import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import Loader from "../common/Loader";

const UserList = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/users");
      setStudents(res.data || []);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Registered Students
          </h3>
          <p className="text-xs text-slate-500">
            Total registered student accounts: {students.length}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll no, email..."
            className="px-3 py-1.5 text-xs border border-slate-300 rounded bg-white w-64 focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <Loader message="Loading registered students..." />
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            {students.length === 0
              ? "No students registered in system yet"
              : "No students matching search filter"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Institute Email</th>
                  <th className="py-3 px-4">Hostel</th>
                  <th className="py-3 px-4">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {s.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {s.rollNumber || "—"}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{s.email}</td>
                    <td className="py-3 px-4">
                      <span className="capitalize text-[11px] font-medium text-slate-700">
                        {s.hostel ? `${s.hostel} hostel` : "—"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {s.createdAt
                        ? new Date(s.createdAt).toLocaleDateString()
                        : "—"}
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

export default UserList;
