import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';

const roleLabels = {
  admin: 'Administrator',
  mess1: 'Mess 1 Vendor',
  mess2: 'Mess 2 Vendor',
  student: 'Student'
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time live date and time ticker (updates every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo / Brand */}
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="IIIT Dharwad"
                className="h-11 w-auto object-contain bg-white rounded p-0.5 border border-slate-100 shadow-xs"
              />
              <div>
                <h1 className="text-sm font-bold text-slate-900 leading-tight">
                  IIIT Dharwad
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  Mess Allocation & Dining Portal
                </p>
              </div>
            </div>

            {/* Real-time live clock badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold">{formattedDate}</span>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-mono font-bold text-slate-900">{formattedTime}</span>
            </div>

            {/* User Session Info & Actions */}
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 justify-end">
                    <span>{user.email}</span>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {roleLabels[user.role] || user.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded hover:bg-slate-100 transition-colors"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-medium text-red-600 hover:text-red-700 px-2.5 py-1.5 rounded hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
};

export default Navbar;
