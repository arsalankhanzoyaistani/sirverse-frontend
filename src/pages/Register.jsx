// frontend/src/pages/Register.jsx - COMPLETE NEW REGISTRATION PAGE
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../utils/api";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    user_type: "",
    student_class: "",
    password: "",
    confirm_password: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required";
    if (!formData.user_type) newErrors.user_type = "Please select user type";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirm_password) newErrors.confirm_password = "Please confirm password";

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    if (formData.user_type === 'student' && !formData.student_class) {
      newErrors.student_class = "Class is required for students";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await register(formData);
      
      if (res.ok) {
        // Save token and user info
        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("username", res.data.user.username);
        localStorage.setItem("user_id", res.data.user.id);
        
        // Redirect to posts page
        navigate("/posts");
      } else {
        setErrors({ submit: res.data?.error || "Registration failed" });
      }
    } catch (error) {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-gray-50 to-blue-50">
      <GlassCard className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <div className="relative mb-4">
            <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden">
              <img
                src="/logo.png"
                alt="SirVerse Logo"
                className="w-full h-full rounded-2xl object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] animate-shine"></div>
            </div>
            <div className="absolute inset-0 bg-blue-400/30 rounded-2xl blur-md -z-10 animate-pulse"></div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Join SirVerse</h1>
          <p className="text-gray-600 mt-2">Create your account to get started</p>
        </div>

        {errors.submit && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name *"
              type="text"
              name="first_name"
              placeholder="Enter your first name"
              value={formData.first_name}
              onChange={handleChange}
              error={errors.first_name}
              required
            />

            <Input
              label="Last Name *"
              type="text"
              name="last_name"
              placeholder="Enter your last name"
              value={formData.last_name}
              onChange={handleChange}
              error={errors.last_name}
              required
            />
          </div>

          <Input
            label="Username *"
            type="text"
            name="username"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Address *"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            <Input
              label="Phone Number (Optional)"
              type="tel"
              name="phone"
              placeholder="+1234567890"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
            />
          </div>

          <Input
            label="Date of Birth *"
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            error={errors.date_of_birth}
            required
          />

          {formData.date_of_birth && (
            <div className="text-sm text-gray-600">
              Age: {calculateAge(formData.date_of_birth)} years old
              {calculateAge(formData.date_of_birth) < 13 && (
                <span className="text-red-500 ml-2">Must be at least 13 years old</span>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am a *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleChange({ target: { name: 'user_type', value: 'student' } })}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  formData.user_type === 'student'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => handleChange({ target: { name: 'user_type', value: 'teacher' } })}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  formData.user_type === 'teacher'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                👨‍🏫 Teacher
              </button>
            </div>
            {errors.user_type && (
              <p className="text-red-500 text-sm mt-1">{errors.user_type}</p>
            )}
          </div>

          {formData.user_type === 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class/Grade *
              </label>
              <select
                name="student_class"
                value={formData.student_class}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select your class</option>
                {[6, 7, 8, 9, 10, 11, 12].map(grade => (
                  <option key={grade} value={grade}>
                    Grade {grade}
                  </option>
                ))}
              </select>
              {errors.student_class && (
                <p className="text-red-500 text-sm mt-1">{errors.student_class}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Password *"
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

            <Input
              label="Confirm Password *"
              type="password"
              name="confirm_password"
              placeholder="Confirm your password"
              value={formData.confirm_password}
              onChange={handleChange}
              error={errors.confirm_password}
              required
            />
          </div>

          <Button type="submit" full loading={loading}>
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:text-blue-600 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
