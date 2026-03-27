import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { 
  FiHome, 
  FiUsers, 
  FiAirplay, 
  FiHome as FiHotel, 
  FiKey, 
  FiCalendar, 
  FiCreditCard, 
  FiSettings, 
  FiLogOut,
  FiMenu,
  FiX
} from "react-icons/fi";
import { logoutAdmin } from "../features/users/userSlice";

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  
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
    { path: "/dashboard", name: "Dashboard", icon: FiHome },
    { path: "/users", name: "Users", icon: FiUsers },
    { path: "/flights", name: "Flights", icon: FiAirplay },
    { path: "/hotels", name: "Hotels", icon: FiHotel },
    { path: "/rooms", name: "Rooms", icon: FiKey },
    { path: "/bookings", name: "Bookings", icon: FiCalendar },
    { path: "/payments", name: "Payments", icon: FiCreditCard },
    { path: "/settings", name: "Settings", icon: FiSettings },
  ];

  const handleLogout = async () => {
    await dispatch(logoutAdmin());
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-linear-to-r from-orange-600 to-orange-500 shadow-lg px-4 py-4 z-30 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">123 Reserve</h2>
          <p className="text-xs text-orange-100 mt-0.5">Admin Dashboard</p>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200"
        >
          <FiMenu className="w-6 h-6 text-white" />
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={toggleMobileMenu}
        />
      )}

    
      <div
        className={`
          fixed lg:fixed inset-y-0 left-0 transform
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          w-70 lg:w-58 bg-white border-r border-gray-200 z-50
          flex flex-col h-screen overflow-hidden shadow-xl lg:shadow-none
        `}
      >
      
        <div className="shrink-0 p-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">123 Reserve</h2>
            <p className="text-sm text-gray-500 mt-1">Admin Dashboard</p>
          </div>
     
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
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
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg
                    transition-all duration-200 group relative
                    ${active
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                    }
                  `}
                >
                  <Icon
                    className={`
                      w-5 h-5 shrink-0 transition-all duration-200
                      ${active
                        ? "text-orange-600"
                        : "text-gray-400 group-hover:text-orange-600"
                      }
                    `}
                  />
                  <span className="font-medium text-sm truncate">{item.name}</span>
                  {active && (
                    <span className="absolute right-4 w-1.5 h-1.5 bg-orange-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

      
        <div className="shrink-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg
                       text-gray-600 hover:bg-red-50 hover:text-red-600
                       transition-all duration-200 group"
          >
            <FiLogOut className="w-5 h-5 text-gray-400 group-hover:text-red-600 shrink-0 transition-colors" />
            <span className="font-medium text-sm truncate">Logout</span>
          </button>
        </div>
      </div>

    
      <div className="lg:hidden h-16" />
    </>
  );
};

export default Sidebar;