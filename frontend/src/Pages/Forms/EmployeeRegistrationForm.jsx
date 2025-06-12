import { useState, useEffect } from "react";
import {
  User,
  Lock,
  Building2,
  Eye,
  EyeOff,
  UserPlus,
  UserCheck,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";

export default function EmployeeRegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    password: "",
    confirmPassword: "",
    department: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const navigate = useNavigate();

  const departments = [
    { id: "1", name: "Human Resources", displayName: "HR" },
    { id: "2", name: "Information Technology", displayName: "IT" },
    { id: "3", name: "Finance", displayName: "Finance" },
  ];

  const Toast = ({ message, type, onClose }) => (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-500 ease-in-out ${
        toast ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`flex items-center p-4 rounded-lg shadow-lg max-w-md ${
          type === "success"
            ? "bg-green-50 border border-green-200 text-green-800"
            : "bg-red-50 border border-red-200 text-red-800"
        }`}
      >
        {type === "success" ? (
          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600 mr-3" />
        )}
        <p className="flex-1 text-sm">{message}</p>
        <button
          onClick={onClose}
          className={`ml-4 ${type === "success" ? "text-green-600" : "text-red-600"}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
        if (toast.type === "success") {
          setShouldRedirect(true);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (shouldRedirect) {
      navigate("/login");
    }
  }, [shouldRedirect, navigate]);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (formData.name.length < 2) newErrors.name = "Name must be at least 2 characters";

    if (!formData.employeeId.trim()) newErrors.employeeId = "Employee ID is required";
    else if (formData.employeeId.length < 3)
      newErrors.employeeId = "Employee ID must be at least 3 characters";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!formData.department) newErrors.department = "Please select a department";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast("Please fix the errors above", "error");
      return;
    }

    setIsSubmitting(true);

  const selectedDepartment = departments.find(dept => dept.id === formData.department);

    const registrationData = {
      name: formData.name,
      employeeId: formData.employeeId,
      password: formData.password,
      department: selectedDepartment ? selectedDepartment.displayName : "",
    };

    try {
      await axios.post("http://localhost:8080/api/employees/register", registrationData);
      setRegistrationSuccess(true);
      showToast("Employee registered successfully!", "success");

      setTimeout(() => {
        navigate("/login")
      },2000)
    } catch (error) {
      let errorMessage = "Registration failed";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.request) {
        errorMessage = "No response from server";
      } else {
        errorMessage = error.message;
      }
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      employeeId: "",
      password: "",
      confirmPassword: "",
      department: "",
    });
    setRegistrationSuccess(false);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 relative overflow-hidden">
        {registrationSuccess && (
          <div className="absolute inset-0 bg-green-50 bg-opacity-95 flex items-center justify-center z-10 transition-all duration-500">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">Account Created!</h3>
              <p className="text-green-600 mb-4">Welcome to our Leave Management System</p>
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Login Account
              </button>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Employee Registration</h2>
          <p className="text-gray-600">Join our Leave Management System</p>
        </div>

        <div className="space-y-6">
          {/* Name */}
          <InputField
            id="name"
            name="name"
            label="Full Name"
            icon={<UserCheck className="h-5 w-5 text-gray-400" />}
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            error={errors.name}
          />

          {/* Employee ID */}
          <InputField
            id="employeeId"
            name="employeeId"
            label="Employee ID"
            icon={<User className="h-5 w-5 text-gray-400" />}
            value={formData.employeeId}
            onChange={handleInputChange}
            placeholder="Enter your employee ID"
            error={errors.employeeId}
          />

          {/* Password */}
          <InputField
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            icon={<Lock className="h-5 w-5 text-gray-400" />}
            toggleIcon={showPassword ? EyeOff : Eye}
            onToggle={() => setShowPassword(!showPassword)}
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            error={errors.password}
          />

          {/* Confirm Password */}
          <InputField
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            label="Confirm Password"
            icon={<Lock className="h-5 w-5 text-gray-400" />}
            toggleIcon={showConfirmPassword ? EyeOff : Eye}
            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Re-enter your password"
            error={errors.confirmPassword}
          />

          {/* Department Select */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <div className="relative">
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className={`block w-full pl-3 pr-10 py-3 border ${
                  errors.department ? "border-red-300 bg-red-50" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.displayName}
                  </option>
                ))}
              </select>
            </div>
            {errors.department && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <XCircle className="w-4 h-4 mr-1" /> {errors.department}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            {isSubmitting ? "Submitting..." : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Reusable Input Component
function InputField({
  id,
  name,
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  toggleIcon,
  onToggle,
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`block w-full pl-10 pr-10 py-3 border ${
            error ? "border-red-300 bg-red-50" : "border-gray-300"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
        />
        {toggleIcon && (
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={onToggle}
          >
            {toggleIcon && <toggleIcon className="w-5 h-5 text-gray-500" />}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <XCircle className="w-4 h-4 mr-1" /> {error}
        </p>
      )}
    </div>
  );
}