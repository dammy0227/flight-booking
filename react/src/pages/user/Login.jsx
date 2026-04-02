import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, firebaseLogin } from '../../features/users/userSlice';
import { signInWithGoogle } from "../../firebase"; 
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiArrowLeft,
  FiLogIn,
  FiChevronRight,
  FiShield,
  FiGlobe,
  FiUsers,
  FiAward,
  FiStar
} from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.users);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const result = await dispatch(loginUser({
        email: formData.email.trim(),
        password: formData.password.trim()
      })).unwrap();
      
      if (result.user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true); 
    try {
      const firebaseUser = await signInWithGoogle();
      
      if (!firebaseUser || !firebaseUser.token) {
        throw new Error('Google sign-in failed');
      }

      const result = await dispatch(firebaseLogin({ token: firebaseUser.token })).unwrap();

      if (result.user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (err) {
      console.error('Google login error:', err);
    } finally {
      setGoogleLoading(false); 
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0A0E1A] via-[#0F1422] to-[#141A2A] flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-[#C9A84C]/20 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-linear-to-br from-[#C9A84C] to-[#E8C97A] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-[#0A0E1A] text-2xl font-black">123</span>
              </div>
              <div>
                <span className="text-[#F5F0E8] text-2xl font-black tracking-wide">123 </span>
                <span className="text-[#C9A84C] text-2xl font-black tracking-wide">RESERVE</span>
              </div>
            </div>
            <p className="text-[#8B92A5] text-sm mt-2">Premium Travel Management Platform</p>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-[#F5F0E8] leading-tight">
              Welcome to the<br />
              <span className="text-[#C9A84C]">Future of Travel</span>
            </h1>
            <p className="text-[#8B92A5] text-lg leading-relaxed">
              Access exclusive deals, manage bookings, and experience seamless travel management with our enterprise-grade platform.
            </p>
            
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-[#C9A84C] mb-2">
                  <FiGlobe size={24} />
                </div>
                <p className="text-2xl font-bold text-[#F5F0E8]">150+</p>
                <p className="text-[#8B92A5] text-sm">Destinations</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-[#C9A84C] mb-2">
                  <FiUsers size={24} />
                </div>
                <p className="text-2xl font-bold text-[#F5F0E8]">50K+</p>
                <p className="text-[#8B92A5] text-sm">Happy Travelers</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-[#C9A84C] mb-2">
                  <FiAward size={24} />
                </div>
                <p className="text-2xl font-bold text-[#F5F0E8]">99%</p>
                <p className="text-[#8B92A5] text-sm">Satisfaction Rate</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-[#8B92A5]">
              <FiShield size={16} />
              <span>Secure Login</span>
            </div>
            <div className="w-px h-4 bg-[#252E44]"></div>
            <div className="flex items-center gap-2 text-[#8B92A5]">
              <FiStar size={16} />
              <span>4.9/5 Rating</span>
            </div>
            <div className="w-px h-4 bg-[#252E44]"></div>
            <div className="flex items-center gap-2 text-[#8B92A5]">
              <FiLock size={16} />
              <span>256-bit SSL</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 lg:p-12">
        <div className="w-full max-w-120">
          <button 
            onClick={() => navigate('/')} 
            className="lg:hidden flex items-center gap-2 text-[#8B92A5] hover:text-[#C9A84C] transition-colors mb-8"
          >
            <FiArrowLeft size={20} />
            <span>Back to Home</span>
          </button>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8 md:p-10">
            <div className="mb-8">
              <div className="hidden lg:block mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-[#C9A84C] to-[#E8C97A] rounded-lg flex items-center justify-center">
                    <span className="text-[#0A0E1A] text-lg font-black">123</span>
                  </div>
                  <div>
                    <span className="text-[#F5F0E8] text-xl font-black tracking-wide">123 </span>
                    <span className="text-[#C9A84C] text-xl font-black tracking-wide">RESERVE</span>
                  </div>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-[#F5F0E8] mb-2">
                Sign in
              </h1>
              <p className="text-[#8B92A5]">
                Access your account to manage bookings
              </p>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-[#8B92A5] text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B92A5] size-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={`w-full pl-12 pr-4 py-3 bg-[#1C2438] border rounded-xl text-[#F5F0E8] placeholder:text-[#8B92A5]/50 transition-all focus:outline-none focus:ring-2 ${
                      errors.email 
                        ? 'border-red-500 focus:ring-red-500/20' 
                        : 'border-white/10 focus:border-[#C9A84C] focus:ring-[#C9A84C]/20'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[#8B92A5] text-sm font-medium">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[#C9A84C] text-sm hover:opacity-80 transition-opacity"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B92A5] size-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`w-full pl-12 pr-12 py-3 bg-[#1C2438] border rounded-xl text-[#F5F0E8] placeholder:text-[#8B92A5]/50 transition-all focus:outline-none focus:ring-2 ${
                      errors.password 
                        ? 'border-red-500 focus:ring-red-500/20' 
                        : 'border-white/10 focus:border-[#C9A84C] focus:ring-[#C9A84C]/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B92A5] hover:text-[#C9A84C] transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-linear-to-r from-[#C9A84C] to-[#E8C97A] text-[#0A0E1A] font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-[#C9A84C]/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#0A0E1A] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FiLogIn size={20} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#1C2438] text-[#8B92A5]">Or continue with</span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading || googleLoading}
                className="w-full py-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[#F5F0E8] font-medium">Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <FaGoogle className="w-5 h-5 text-[#F5F0E8]" />
                    <span className="text-[#F5F0E8] font-medium">Continue with Google</span>
                  </>
                )}
              </button>
              
              <div className="text-center pt-4">
                <p className="text-[#8B92A5]">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-[#C9A84C] font-semibold hover:opacity-80 transition-opacity inline-flex items-center gap-1">
                    Create account
                    <FiChevronRight size={16} />
                  </Link>
                </p>
              </div>
            </form>
          </div>

          <div className="lg:hidden mt-6 flex justify-center gap-6 text-xs text-[#8B92A5]">
            <div className="flex items-center gap-2">
              <FiShield size={14} />
              <span>Secure Login</span>
            </div>
            <div className="w-px h-3 bg-[#252E44]"></div>
            <div className="flex items-center gap-2">
              <FiStar size={14} />
              <span>4.9 Rating</span>
            </div>
            <div className="w-px h-3 bg-[#252E44]"></div>
            <div className="flex items-center gap-2">
              <FiLock size={14} />
              <span>SSL Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;