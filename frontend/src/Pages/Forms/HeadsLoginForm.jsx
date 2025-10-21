import { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from "../../config/api";

export default function HeadsLoginForm() {
  const [formData, setFormData] = useState({
    adminId: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.adminId.trim()) {
      newErrors.adminId = 'Admin ID is required';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

// ...existing code...
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) {
    return;
  }

  setIsSubmitting(true);

  try {
    const response = await fetch(API_ENDPOINTS.HEADS_LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeId: formData.adminId,
        password: formData.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      setErrors({ general: errorData.message || 'Login failed. Please try again.' });
      return;
    }


    // If login is successful, you can store token or user info here if needed
    const data = await response.json();
    handleNavigation('/head-dashboard');
    sessionStorage.setItem('headId',data.employeeId)
    sessionStorage.setItem('headDepartement',data.department)
    sessionStorage.setItem('name',data.name)


  } catch (error) {
    console.error('Login error:', error);
    setErrors({ general: 'Login failed. Please try again.' });
  } finally {
    setIsSubmitting(false);
  }
};
// ...existing code...

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Administrator Access</h2>
          <p className="text-gray-600">Management Dashboard Portal</p>
        </div>

        {errors.general && (
          <p className="text-sm text-red-600 text-center mb-4">{errors.general}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Admin ID Field */}
          <div>
            <label htmlFor="adminId" className="block text-sm font-medium text-gray-700 mb-2">
              Administrator ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Shield className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="adminId"
                name="adminId"
                value={formData.adminId}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`block w-full pl-10 pr-3 py-3 border ${
                  errors.adminId ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                placeholder="Enter your administrator ID"
                autoComplete="username"
                aria-describedby={errors.adminId ? 'adminId-error' : undefined}
              />
            </div>
            {errors.adminId && (
              <p id="adminId-error" className="mt-1 text-sm text-red-600">
                {errors.adminId}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`block w-full pl-10 pr-10 py-3 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Keep me signed in
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                onClick={() => handleNavigation('/reset-password')}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Reset password?
              </a>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Authenticating...
              </div>
            ) : (
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Access Dashboard
              </div>
            )}
          </button>
        </form>

        {/* Additional Options */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Quick Access</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleNavigation('/login')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Employee Login
            </button>
            <button
              onClick={() => handleNavigation('/system-status')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            >
              System Status
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Admin Portal • Leave Management System v2.0
          </p>
        </div>
      </div>
    </div>
  );
}