import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiUser,
  FiMail,
  FiShield,
  FiEdit2,
  FiCamera,
  FiX,
  FiSave,
  FiCalendar,
  FiInfo,
  FiLoader,
  FiCreditCard
} from 'react-icons/fi';
import { updateProfile } from '../../features/users/userSlice';

const UserProfile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.users);
  
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.image || null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user?.name && !editMode) {
      setName(user.name);
    }
    if (user?.image && !editMode) {
      setImagePreview(user.image);
    }
  }, [user?.name, user?.image, editMode]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setErrors({ name: 'Name is required' });
      return;
    }

    const userId = user?._id || user?.id;
    if (!userId) {
      console.error('No user ID found');
      alert('User ID not found. Please log in again.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    try {
      const result = await dispatch(updateProfile({
        id: userId,
        formData: formData
      })).unwrap();

      if (result) {
        setEditMode(false);
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const userId = user?._id || user?.id;

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                My Profile
              </h1>
              <p className="text-gray-500 text-sm mt-1">Manage your account information</p>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm ${
                editMode
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-gray-100 text-[#C9A84C] hover:bg-gray-200'
              }`}
            >
              {editMode ? <FiX size={16} /> : <FiEdit2 size={16} />}
              <span className="font-semibold">{editMode ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex flex-col items-center">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-linear-to-br from-[#C9A84C]/40 to-[#C9A84C]/10 p-1">
                  <div className="w-full h-full rounded-full bg-white overflow-hidden">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt={user?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-3xl sm:text-4xl font-bold text-[#C9A84C]">
                          {user?.name?.charAt(0)?.toUpperCase() || <FiUser size={28} className="text-gray-400" />}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {editMode && (
                  <label className="absolute bottom-0 right-0 p-1.5 sm:p-2 bg-[#C9A84C] rounded-full cursor-pointer hover:bg-[#B8922E] transition-colors shadow-sm">
                    <FiCamera size={12} className="text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Name and Email */}
              {editMode ? (
                <div className="mt-6 w-full max-w-md">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-800 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50 transition-colors ${
                      errors.name ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 px-4 py-2.5 bg-[#C9A84C] rounded-xl text-white font-semibold hover:bg-[#B8922E] transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      {loading ? (
                        <FiLoader className="animate-spin" size={16} />
                      ) : (
                        <>
                          <FiSave size={16} />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setName(user?.name || '');
                        setImagePreview(user?.image || null);
                        setSelectedImage(null);
                      }}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:text-gray-800 hover:border-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{user?.name}</h2>
                  <p className="text-gray-500 text-sm mt-1 break-all">{user?.email}</p>
                  <div className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full bg-gray-100">
                    <FiShield size={12} className="text-[#C9A84C]" />
                    <span className="text-[#C9A84C] text-xs font-semibold uppercase">
                      {user?.role || 'User'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider flex items-center gap-2">
              <FiInfo size={14} className="text-[#C9A84C]" />
              Account Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <FiMail className="text-[#C9A84C]" size={18} />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-500 text-xs">Email</p>
                  <p className="text-gray-800 text-sm font-medium truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <FiShield className="text-[#C9A84C]" size={18} />
                <div className="flex-1">
                  <p className="text-gray-500 text-xs">Role</p>
                  <p className="text-gray-800 text-sm font-medium capitalize">{user?.role || 'User'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <FiCalendar className="text-[#C9A84C]" size={18} />
                <div className="flex-1">
                  <p className="text-gray-500 text-xs">Member Since</p>
                  <p className="text-gray-800 text-sm font-medium">{formatDate(user?.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <FiCreditCard className="text-[#C9A84C]" size={18} />
                <div className="flex-1">
                  <p className="text-gray-500 text-xs">User ID</p>
                  <p className="text-gray-800 text-sm font-mono">{userId?.slice(-12)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;