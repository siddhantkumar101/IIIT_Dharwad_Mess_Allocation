import React from 'react';
import Login from '../components/auth/Login';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <Login />
      <p className="mt-6 text-xs text-slate-400">
        Indian Institute of Information Technology, Dharwad
      </p>
    </div>
  );
};

export default LoginPage;

