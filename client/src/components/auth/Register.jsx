import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

// Student email must end with @iiitdwd.ac.in (or @iiitdharwad.ac.in)
const emailRegex = /^[^\s@]+@(iiitdwd\.ac\.in|iiitdharwad\.ac\.in)$/;

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    hostel: 'boys'
  });

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Inline email validation
    if (name === 'email') {
      const val = value.trim().toLowerCase();
      if (val && !emailRegex.test(val)) {
        setEmailError('Email must end with @iiitdwd.ac.in');
      } else {
        setEmailError('');
      }
    }

    // Inline password validation
    if (name === 'password') {
      if (value && value.length < 6) {
        setPasswordError('Password must be at least 6 characters');
      } else {
        setPasswordError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const normalizedEmail = formData.email.trim().toLowerCase();

    // Client-side validation checks
    if (!emailRegex.test(normalizedEmail)) {
      setEmailError('Invalid email domain. Must be @iiitdwd.ac.in');
      return;
    }

    if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: formData.name.trim(),
        email: normalizedEmail,
        password: formData.password,
        rollNumber: formData.rollNumber.trim(),
        hostel: formData.hostel
      });

      const { token, user } = res.data;
      // Auto-login
      login(token, user);

      // Redirect directly to Student Dashboard
      navigate('/student', { replace: true });
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Registration</h2>
        <p className="text-xs text-slate-500 mt-1">
          Create your account with your official @iiitdwd.ac.in ID
        </p>
      </div>

      {apiError && (
        <div className="mb-4 p-3 rounded text-xs bg-red-50 text-red-700 border border-red-200">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            required
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Siddharth Verma"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Institute Email ID (@iiitdwd.ac.in)
          </label>
          <input
            type="email"
            required
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="rollnumber@iiitdwd.ac.in"
            className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 transition-colors ${
              emailError ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-sky-500'
            }`}
          />
          {emailError && (
            <p className="mt-1 text-[11px] text-red-600 font-medium">{emailError}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Password (min 6 characters)
          </label>
          <input
            type="password"
            required
            minLength={6}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 transition-colors ${
              passwordError ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-sky-500'
            }`}
          />
          {passwordError && (
            <p className="mt-1 text-[11px] text-red-600 font-medium">{passwordError}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Roll Number
            </label>
            <input
              type="text"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              placeholder="e.g. 2022bcs001"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hostel
            </label>
            <select
              name="hostel"
              value={formData.hostel}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 bg-white"
            >
              <option value="boys">Boys Hostel</option>
              <option value="girls">Girls Hostel</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || Boolean(emailError) || Boolean(passwordError)}
          className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded transition-colors disabled:opacity-50 mt-2 shadow-sm cursor-pointer"
        >
          {loading ? 'Creating Account...' : 'Register Account'}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-sky-700 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Register;
