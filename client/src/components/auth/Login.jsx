import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const roleRedirectMap = {
  admin: '/admin',
  mess1: '/mess1',
  mess2: '/mess2',
  student: '/student'
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password
      });

      const { token, user } = res.data;
      login(token, user);

      // Redirect based on role in JWT / user payload
      const targetPath = roleRedirectMap[user.role] || '/student';
      navigate(targetPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-sm p-8">
      <div className="mb-6 text-center">
        <div className="flex justify-center mb-3">
          <img
            src="/logo.png"
            alt="IIIT Dharwad"
            className="h-16 w-auto object-contain p-1 border border-slate-100 rounded bg-white shadow-xs"
          />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sign In</h2>
        <p className="text-xs text-slate-500 mt-1">
          Access your IIIT Dharwad Mess Portal
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded text-xs bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Institute Email ID
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. 2022bcs001@iiitdwd.ac.in"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded transition-colors disabled:opacity-50 mt-2 shadow-sm cursor-pointer"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
        New student?{' '}
        <Link to="/register" className="font-semibold text-sky-700 hover:underline">
          Register student account
        </Link>
      </div>
    </div>
  );
};

export default Login;
