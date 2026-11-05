import React from 'react';
import Register from '../components/auth/Register';

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <Register />
      <p className="mt-6 text-xs text-slate-400">
        Indian Institute of Information Technology, Dharwad
      </p>
    </div>
  );
};

export default RegisterPage;

