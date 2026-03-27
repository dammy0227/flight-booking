import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, clearError } from "../features/users/userSlice";
import { getFlightStats } from "../features/flights/flightSlice";
import { getHotelStats } from "../features/hotels/hotelSlice";
import { getRoomStats } from "../features/rooms/roomSlice";
import {
  FiUser, FiMail, FiCamera, FiSave, FiCheck,
  FiAlertTriangle, FiBarChart2, FiTrendingUp,
  FiHome, FiCalendar, FiDollarSign, FiLayers,
  FiClock, FiStar,
} from "react-icons/fi";

const Section = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const StatTile = ({ label, value, icon, bg }) => (
  <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
    <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value ?? "—"}</p>
    </div>
  </div>
);

const Settings = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.users);

  const flightStats = useSelector((state) => state.flights?.stats);
  const hotelStats = useSelector((state) => state.hotels?.stats);
  const roomStats = useSelector((state) => state.rooms?.stats);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setImagePreview(user.image || null);
    }
  }, [user]);

  useEffect(() => {
    dispatch(getFlightStats());
    dispatch(getHotelStats());
    dispatch(getRoomStats());
    return () => dispatch(clearError());
  }, [dispatch]);

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!user?._id && !user?.id) return;

    const formData = new FormData();
    formData.append("name", name);
    if (imageFile) formData.append("image", imageFile);

    const result = await dispatch(
      updateProfile({ id: user._id || user.id, formData })
    );
    if (!result.error) {
      setImageFile(null);
      flash("Profile updated successfully");
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—";

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "overview", label: "System Overview" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your profile and view system overview
          </p>
        </div>

        {successMsg && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <FiCheck className="w-4 h-4 shrink-0" />
            {successMsg}
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <FiAlertTriangle className="w-4 h-4 shrink-0" />
            {typeof error === "string" ? error : "Something went wrong"}
          </div>
        )}

        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === t.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "profile" && (
          <div className="space-y-6">

            <Section
              title="Account Information"
              subtitle="Your login details and membership info"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FiMail className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Email address</p>
                    <p className="text-sm font-medium text-gray-900">{email || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FiCalendar className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Member since</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(user?.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FiUser className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                      user?.role === "admin"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {user?.role || "—"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FiLayers className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">User ID</p>
                    <p className="text-sm font-mono text-gray-600 truncate">
                      {(user?._id || user?.id || "—").slice(-12)}
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            <Section
              title="Edit Profile"
              subtitle="Update your name and profile photo"
            >
              <form onSubmit={handleProfileSave} className="space-y-5">
                <div className="flex items-center gap-5">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiUser className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiCamera className="w-5 h-5 text-white" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Profile photo</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-1 text-sm text-orange-600 hover:text-orange-700"
                    >
                      Change photo
                    </button>
                    {imageFile && (
                      <p className="text-xs text-gray-400 mt-0.5">{imageFile.name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                    <span className="ml-2 text-xs font-normal text-gray-400">(cannot be changed)</span>
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <FiSave className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </Section>

          </div>
        )}

        {activeTab === "overview" && (
          <div className="space-y-6">

            <Section
              title="Flights Overview"
              subtitle="Current flight inventory statistics"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatTile label="Total Flights" value={flightStats?.totalFlights} icon={<FiBarChart2 className="w-4 h-4 text-blue-600" />} bg="bg-blue-100" />
                <StatTile label="Today" value={flightStats?.todayFlights} icon={<FiCalendar className="w-4 h-4 text-orange-600" />} bg="bg-orange-100" />
                <StatTile label="This Week" value={flightStats?.weekFlights} icon={<FiTrendingUp className="w-4 h-4 text-green-600" />} bg="bg-green-100" />
                <StatTile label="Tomorrow" value={flightStats?.tomorrowFlights} icon={<FiClock className="w-4 h-4 text-teal-600" />} bg="bg-teal-100" />
                <StatTile
                  label="Avg Ticket Price"
                  value={flightStats?.avgPrice != null ? `$${flightStats.avgPrice}` : "—"}
                  icon={<FiDollarSign className="w-4 h-4 text-purple-600" />}
                  bg="bg-purple-100"
                />
              </div>
            </Section>

            <Section
              title="Hotels Overview"
              subtitle="Current hotel inventory statistics"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatTile label="Total Hotels" value={hotelStats?.totalHotels} icon={<FiHome className="w-4 h-4 text-orange-600" />} bg="bg-orange-100" />
                <StatTile
                  label="Avg Rating"
                  value={hotelStats?.avgRating != null ? `${hotelStats.avgRating} ⭐` : "—"}
                  icon={<FiStar className="w-4 h-4 text-yellow-600" />}
                  bg="bg-yellow-100"
                />
                <StatTile label="Cities Covered" value={hotelStats?.totalCities} icon={<FiLayers className="w-4 h-4 text-green-600" />} bg="bg-green-100" />
                <StatTile label="High Rated" value={hotelStats?.highRated} icon={<FiStar className="w-4 h-4 text-purple-600" />} bg="bg-purple-100" />
                <StatTile label="New This Week" value={hotelStats?.newThisWeek} icon={<FiClock className="w-4 h-4 text-teal-600" />} bg="bg-teal-100" />
              </div>
            </Section>

            <Section
              title="Rooms Overview"
              subtitle="Current room inventory statistics"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatTile label="Total Rooms" value={roomStats?.totalRooms} icon={<FiHome className="w-4 h-4 text-blue-600" />} bg="bg-blue-100" />
                <StatTile label="Available" value={roomStats?.availableRooms} icon={<FiCheck className="w-4 h-4 text-green-600" />} bg="bg-green-100" />
                <StatTile
                  label="Avg Price"
                  value={roomStats?.avgPrice != null ? `$${roomStats.avgPrice}` : "—"}
                  icon={<FiDollarSign className="w-4 h-4 text-orange-600" />}
                  bg="bg-orange-100"
                />
                <StatTile label="Room Types" value={roomStats?.totalTypes} icon={<FiLayers className="w-4 h-4 text-purple-600" />} bg="bg-purple-100" />
              </div>
            </Section>

          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;