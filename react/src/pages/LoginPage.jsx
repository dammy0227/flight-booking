import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../features/users/userSlice";
import { useNavigate } from "react-router-dom";
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiArrowRight,
  FiGlobe,
  FiShield,
  FiClock
} from "react-icons/fi";
import { FaPlane, FaHotel, FaKey } from "react-icons/fa";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.users);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      navigate("/dashboard");
    } catch (err) {
      console.log("Login failed", err);
    }
  };

  return (
    <div className="min-h-screen flex bg-linear-to-br from-gray-50 to-gray-100">
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-orange-500 to-orange-700 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white opacity-5 rounded-full"></div>
        
       
        <div className="absolute top-20 left-20 animate-float-slow">
          <FaPlane className="w-12 h-12 text-white/20" />
        </div>
        <div className="absolute bottom-32 right-20 animate-float-medium">
          <FaHotel className="w-16 h-16 text-white/20" />
        </div>
        <div className="absolute top-1/3 right-32 animate-float-fast">
          <FaKey className="w-10 h-10 text-white/20" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <FaPlane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">123 Reserve</h1>
              <p className="text-orange-100 text-sm">Admin Dashboard</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Manage Your<br />
              Booking Platform
            </h2>
            <p className="text-orange-100 text-lg">
              Complete control over flights, hotels, rooms, and more
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-3 text-white/90">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FiGlobe className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Global Management</p>
                <p className="text-sm text-orange-100">Manage all bookings worldwide</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-white/90">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FiShield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Secure Platform</p>
                <p className="text-sm text-orange-100">Enterprise-grade security</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-white/90">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FiClock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Real-time Updates</p>
                <p className="text-sm text-orange-100">Instant sync across all devices</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-orange-100 text-sm">
          © {new Date().getFullYear()} 123 Reserve. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
              <FaPlane className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">123 Reserve</h1>
            <p className="text-gray-500 mt-1">Admin Panel Login</p>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-2xl font-semibold text-gray-800">Welcome back</h2>
              <p className="text-gray-500 text-sm mt-1">
                Sign in to access your dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  Email Address
                </label>
                <div
                  className={`relative group transition-all duration-200 ${
                    focusedField === "email" ? "ring-2 ring-orange-200" : ""
                  }`}
                >
                  <FiMail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-orange-500 transition-colors"
                    size={18}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="admin@123reserve.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <button
                    type="button"
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div
                  className={`relative group transition-all duration-200 ${
                    focusedField === "password" ? "ring-2 ring-orange-200" : ""
                  }`}
                >
                  <FiLock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-orange-500 transition-colors"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 border-2 rounded-md transition-all duration-200 ${
                        rememberMe
                          ? "bg-orange-600 border-orange-600"
                          : "border-gray-300 group-hover:border-orange-400"
                      }`}
                    >
                      {rememberMe && (
                        <svg
                          className="w-4 h-4 text-white mx-auto mt-0.5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    Remember me
                  </span>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 animate-shake">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-8 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-red-600">{error}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => dispatch(clearError())}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <span className="text-lg">×</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2 group shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Logging in...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign in to Dashboard</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

           

            {/* Mobile Footer */}
            <div className="lg:hidden mt-8 text-center text-gray-400 text-xs">
              © {new Date().getFullYear()} 123 Reserve. All rights reserved.
            </div>
          </div>
        </div>
      </div>

      {/* Styles for animations */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .animate-float-medium {
          animation: float-medium 4s ease-in-out infinite;
        }
        
        .animate-float-fast {
          animation: float-fast 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;