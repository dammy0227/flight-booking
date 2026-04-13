import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { 
  FiHome, 
  FiCalendar, 
  FiMapPin, 
  FiTrendingUp, 
  FiUser, 
  FiSettings, 
  FiLogOut,
  FiMenu,
  FiX,
  FiStar,
  FiAirplay,
  FiCompass,
  FiBell
} from "react-icons/fi";
import { logoutUser } from "../features/users/userSlice";

const UserSidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const menuItems = [
    { path: "/user-dashboard", name: "Overview", icon: FiHome },
    { path: "/user-dashboard/bookings", name: "My Bookings", icon: FiCalendar },
    { path: "/user-dashboard/flights", name: "Flights", icon: FiTrendingUp },
    { path: "/user-dashboard/hotels", name: "Hotels", icon: FiMapPin },
    { path: "/user-dashboard/rooms", name: "Rooms", icon: FiStar },
    { path: "/user-dashboard/profile", name: "Profile", icon: FiUser },
  ];

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === "/user-dashboard" && location.pathname === "/user-dashboard") {
      return true;
    }
    if (path !== "/user-dashboard" && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getUserInfo = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return {
        name: user?.name || 'User',
        initial: user?.name?.charAt(0) || 'U',
        firstName: user?.name?.split(' ')[0] || 'User',
        email: user?.email || 'traveler@example.com'
      };
    } catch {
      return { name: 'User', initial: 'U', firstName: 'User', email: 'traveler@example.com' };
    }
  };

  const userInfo = getUserInfo();

  return (
    <>
      {/* Mobile Header - Gold Background */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#C9A84C] shadow-sm px-4 py-4 z-30 flex items-center justify-between border-b border-[#B8922E]/20">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <FiAirplay className="text-white text-lg" />
            </div>
            <div className="text-lg font-black tracking-wide">
              <span className="text-white">123 </span>
              <span className="text-white font-bold">RESERVE</span>
            </div>
          </div>
          <p className="text-xs text-white/80 mt-0.5">Travel Dashboard</p>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200"
        >
          <FiMenu className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:fixed inset-y-0 left-0 transform
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          w-72 lg:w-64 bg-white border-r border-gray-100 z-50
          flex flex-col h-screen overflow-hidden shadow-xl lg:shadow-sm
        `}
      >
        {/* Logo Section */}
        <div className="shrink-0 p-6 border-b border-gray-100 bg-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
                <FiAirplay className="text-[#C9A84C] text-xl" />
              </div>
              <div className="text-xl font-black tracking-wide">
                <span className="text-gray-800">123 </span>
                <span className="text-[#C9A84C]">RESERVE</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Travel Dashboard</p>
          </div>
          <button
            onClick={closeMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            aria-label="Close menu"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`
                    flex items-center space-x-3 px-4 py-2.5 rounded-xl
                    transition-all duration-200 group relative
                    ${active
                      ? "bg-[#C9A84C]/10 text-[#C9A84C]"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }
                  `}
                >
                  <Icon
                    className={`
                      w-5 h-5 shrink-0 transition-all duration-200
                      ${active
                        ? "text-[#C9A84C]"
                        : "text-gray-400 group-hover:text-gray-600"
                      }
                    `}
                  />
                  <span className="font-medium text-sm truncate">{item.name}</span>
                  {active && (
                    <span className="absolute right-3 w-1.5 h-1.5 bg-[#C9A84C] rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

        
        </nav>

        {/* User Profile Section */}
        <div className="shrink-0 p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#C9A84C] to-[#B8922E] flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">
                {userInfo.initial}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 text-sm font-semibold truncate">
                {userInfo.firstName}
              </p>
              <p className="text-gray-400 text-xs truncate">
                {userInfo.email}
              </p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <FiBell className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
         
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2.5 w-full rounded-xl mt-1
                       text-gray-500 hover:bg-red-50 hover:text-red-500
                       transition-all duration-200 group"
          >
            <FiLogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500 shrink-0 transition-colors" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Spacer */}
      <div className="lg:hidden h-16" />
    </>
  );
};

export default UserSidebar;