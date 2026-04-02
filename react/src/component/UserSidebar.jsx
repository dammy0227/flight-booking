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
  FiAirplay
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
        firstName: user?.name?.split(' ')[0] || 'User'
      };
    } catch {
      return { name: 'User', initial: 'U', firstName: 'User' };
    }
  };

  const userInfo = getUserInfo();

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-linear-to-r from-[#cfa636] to-[#d8ae44] shadow-lg px-4 py-4 z-30 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-wide text-[#0A0E1A]">123</span>
            <span className="text-xl font-black tracking-wide text-white">RESERVE</span>
          </div>
          <p className="text-xs text-[#0A0E1A] mt-0.5">Travel Dashboard</p>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200"
        >
          <FiMenu className="w-6 h-6 text-[#0A0E1A]" />
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

      <div
        className={`
          fixed lg:fixed inset-y-0 left-0 transform
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          w-72 lg:w-58 bg-[#0F1420] border-r border-[#252E44] z-50
          flex flex-col h-screen overflow-hidden shadow-xl lg:shadow-none
        `}
      >
        <div className="shrink-0 p-6 border-b border-[#252E44] bg-[#0F1420] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#C9A84C]/15 border border-[#C9A84C]/30 flex items-center justify-center">
                <FiAirplay className="text-[#C9A84C] text-lg" />
              </div>
              <div className="text-lg font-black tracking-wide">
                <span className="text-[#F5F0E8]">123 </span>
                <span className="text-[#C9A84C]">RESERVE</span>
              </div>
            </div>
            <p className="text-xs text-[#8B92A5] mt-2">Travel Dashboard</p>
          </div>
          <button
            onClick={closeMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-[#1C2438] transition-colors text-[#8B92A5] hover:text-[#F5F0E8]"
            aria-label="Close menu"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

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
                    flex items-center space-x-3 px-4 py-3 rounded-xl
                    transition-all duration-200 group relative
                    ${active
                      ? "bg-[#C9A84C] text-[#0A0E1A]"
                      : "text-[#8B92A5] hover:bg-[#1C2438] hover:text-[#F5F0E8]"
                    }
                  `}
                >
                  <Icon
                    className={`
                      w-5 h-5 shrink-0 transition-all duration-200
                      ${active
                        ? "text-[#0A0E1A]"
                        : "text-[#8B92A5] group-hover:text-[#F5F0E8]"
                      }
                    `}
                  />
                  <span className="font-medium text-sm truncate">{item.name}</span>
                  {active && (
                    <span className="absolute right-4 w-1.5 h-1.5 bg-[#0A0E1A] rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="shrink-0 p-4 border-t border-[#252E44] bg-[#0F1420]">
          <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-[#1C2438]">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#C9A84C] to-[#E8C97A] flex items-center justify-center">
              <span className="text-[#0A0E1A] text-sm font-bold">
                {userInfo.initial}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-[#F5F0E8] text-sm font-semibold">
                {userInfo.firstName}
              </p>
              <p className="text-[#8B92A5] text-xs">Traveler</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl
                       text-[#8B92A5] hover:bg-[#EF4444]/10 hover:text-[#EF4444]
                       transition-all duration-200 group"
          >
            <FiLogOut className="w-5 h-5 text-[#8B92A5] group-hover:text-[#EF4444] shrink-0 transition-colors" />
            <span className="font-medium text-sm truncate">Logout</span>
          </button>
        </div>
      </div>

      <div className="lg:hidden h-16" />
    </>
  );
};

export default UserSidebar;