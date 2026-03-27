import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUsers,
  updateUserRole,
  deleteUser,
  clearError,
} from "../features/users/userSlice";
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiShield,
  FiTrash2,
  FiEdit,
  FiSearch,
  FiX,
  FiCheck,
  FiFilter,
  FiDownload,
  FiUserCheck,
  FiUserX,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiLock,
  FiUnlock,
  FiStar,
  FiClock,
  FiAward,
} from "react-icons/fi";

const Users = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [showUserDetails, setShowUserDetails] = useState(null);

  useEffect(() => {
    dispatch(getUsers());
    return () => dispatch(clearError());
  }, [dispatch]);

  // Filter out admin users - only show regular users
  const regularUsers = useMemo(() => {
    return users.filter(user => user.role === "user");
  }, [users]);

  // Filter and search users (only regular users)
  const filteredUsers = useMemo(() => {
    let filtered = [...regularUsers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter (though all are users, keep for consistency)
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(
            (user) => new Date(user.createdAt) >= filterDate
          );
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(
            (user) => new Date(user.createdAt) >= filterDate
          );
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(
            (user) => new Date(user.createdAt) >= filterDate
          );
          break;
        default:
          break;
      }
    }

    return filtered;
  }, [regularUsers, searchTerm, roleFilter, dateFilter]);

  // User statistics (only regular users)
  const userStats = useMemo(() => {
    const total = regularUsers.length;
    const active = regularUsers.filter((u) => u.isActive).length;
    const inactive = regularUsers.filter((u) => !u.isActive).length;
    const newThisWeek = regularUsers.filter((u) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(u.createdAt) >= weekAgo;
    }).length;
    
    return { total, active, inactive, newThisWeek };
  }, [regularUsers]);

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u._id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length > 0 && window.confirm(`Delete ${selectedUsers.length} users?`)) {
      selectedUsers.forEach((id) => dispatch(deleteUser(id)));
      setSelectedUsers([]);
    }
  };

  const handleBulkRoleChange = (role) => {
    if (selectedUsers.length > 0 && window.confirm(`Change role for ${selectedUsers.length} users to ${role}?`)) {
      selectedUsers.forEach((id) => 
        dispatch(updateUserRole({ id, data: { role } }))
      );
      setSelectedUsers([]);
    }
  };

  const handleDeleteUser = (userId) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      dispatch(deleteUser(userToDelete));
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleEditRole = (user) => {
    setUserToEdit(user);
    setNewRole(user.role);
    setShowEditRoleModal(true);
  };

  const confirmRoleChange = () => {
    if (userToEdit && newRole !== userToEdit.role) {
      dispatch(updateUserRole({ 
        id: userToEdit._id, 
        data: { role: newRole } 
      }));
    }
    setShowEditRoleModal(false);
    setUserToEdit(null);
    setNewRole("");
  };

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  };

  const getRandomColor = (str) => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-yellow-500",
      "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500",
      "bg-red-500", "bg-orange-500", "bg-cyan-500"
    ];
    let hash = 0;
    for (let i = 0; i < str?.length || 0; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
        <span className="ml-3 text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage regular users and their permissions
            </p>
          </div>

          {/* Stats Cards - Updated for regular users only */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {[
              { label: "Total Users", value: userStats.total, icon: <FiUser className="w-5 h-5 text-blue-600" />, bg: "bg-blue-100" },
              { label: "Active Users", value: userStats.active, icon: <FiUserCheck className="w-5 h-5 text-green-600" />, bg: "bg-green-100" },
              { label: "Inactive Users", value: userStats.inactive, icon: <FiUserX className="w-5 h-5 text-gray-600" />, bg: "bg-gray-100" },
              { label: "New This Week", value: userStats.newThisWeek, icon: <FiClock className="w-5 h-5 text-orange-600" />, bg: "bg-orange-100" },
            ].map(({ label, value, icon, bg }) => (
              <div key={label} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
                  </div>
                  <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}>
                    {icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              >
                <option value="all">All Users</option>
                <option value="user">Regular Users</option>
              </select>

              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 ${
                    viewMode === "grid"
                      ? "bg-orange-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 ${
                    viewMode === "list"
                      ? "bg-orange-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {selectedUsers.length === filteredUsers.length ? "Deselect All" : "Select All"}
                </button>
                <span className="text-sm text-gray-600">
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkRoleChange("admin")}
                  className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  Make Admin
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => dispatch(getUsers())}
              className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Users Grid/List */}
        {!loading && filteredUsers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <FiUser className="mx-auto w-12 h-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm ? "Try adjusting your search" : "No regular users to display"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-full ${getRandomColor(
                          user.name
                        )} flex items-center justify-center text-white font-semibold text-lg`}
                      >
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          getInitials(user.name)
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setShowUserDetails(user)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditRole(user)}
                        className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                        title="Edit Role"
                      >
                        <FiShield className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete User"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Role</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        <div className="flex items-center">
                          <FiUser className="w-3 h-3 mr-1" />
                          User
                        </div>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Joined</span>
                      <span className="text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Status</span>
                      <span
                        className={`flex items-center ${
                          user.isActive ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {user.isActive ? (
                          <>
                            <FiCheck className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <FiX className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-gray-100">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleSelectUser(user._id)}
                      className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                        className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full ${getRandomColor(
                            user.name
                          )} flex items-center justify-center text-white font-semibold text-sm mr-3`}
                        >
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            getInitials(user.name)
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`flex items-center text-sm ${
                          user.isActive ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {user.isActive ? (
                          <>
                            <FiCheck className="w-4 h-4 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <FiX className="w-4 h-4 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setShowUserDetails(user)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditRole(user)}
                        className="p-1 text-gray-400 hover:text-purple-600"
                        title="Edit Role"
                      >
                        <FiShield className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete User"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* User Details Modal */}
        {showUserDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
                <button
                  onClick={() => setShowUserDetails(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div
                    className={`w-16 h-16 rounded-full ${getRandomColor(
                      showUserDetails.name
                    )} flex items-center justify-center text-white font-semibold text-xl`}
                  >
                    {showUserDetails.image ? (
                      <img
                        src={showUserDetails.image}
                        alt={showUserDetails.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(showUserDetails.name)
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{showUserDetails.name}</h3>
                    <p className="text-gray-500">{showUserDetails.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">User ID</p>
                    <p className="font-mono text-sm text-gray-900">{showUserDetails._id}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Role</p>
                    <p className="font-medium text-gray-900 capitalize">{showUserDetails.role}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Joined</p>
                    <p className="text-gray-900">
                      {new Date(showUserDetails.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                    <p className="text-gray-900">
                      {new Date(showUserDetails.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  {showUserDetails.lastActive && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Last Active</p>
                      <p className="text-gray-900">
                        {new Date(showUserDetails.lastActive).toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <p className={`font-medium ${showUserDetails.isActive ? "text-green-600" : "text-gray-400"}`}>
                      {showUserDetails.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Activity Summary</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">0</div>
                      <div className="text-xs text-gray-500">Bookings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">0</div>
                      <div className="text-xs text-gray-500">Reviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">0</div>
                      <div className="text-xs text-gray-500">Favorites</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowUserDetails(null)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleEditRole(showUserDetails);
                    setShowUserDetails(null);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Edit Role
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <FiTrash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete User
              </h3>
              <p className="text-gray-500 text-center mb-6">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Role Modal */}
        {showEditRoleModal && userToEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4">
                <FiShield className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Change User Role
              </h3>
              <p className="text-gray-500 text-center mb-6">
                Change role for {userToEdit.name}
              </p>

              <div className="space-y-4">
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setNewRole("user")}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      newRole === "user"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <FiUser className={`w-6 h-6 mx-auto mb-2 ${newRole === "user" ? "text-green-600" : "text-gray-400"}`} />
                    <span className={`block text-sm font-medium ${newRole === "user" ? "text-green-600" : "text-gray-600"}`}>
                      User
                    </span>
                    <span className="text-xs text-gray-500">Regular user access</span>
                  </button>

                  <button
                    onClick={() => setNewRole("admin")}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      newRole === "admin"
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <FiShield className={`w-6 h-6 mx-auto mb-2 ${newRole === "admin" ? "text-purple-600" : "text-gray-400"}`} />
                    <span className={`block text-sm font-medium ${newRole === "admin" ? "text-purple-600" : "text-gray-600"}`}>
                      Admin
                    </span>
                    <span className="text-xs text-gray-500">Full access</span>
                  </button>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowEditRoleModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRoleChange}
                    disabled={newRole === userToEdit.role}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-white ${
                      newRole === userToEdit.role
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700"
                    }`}
                  >
                    Update Role
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;