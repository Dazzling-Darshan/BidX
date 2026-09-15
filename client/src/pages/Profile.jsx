import { useState, useRef, useEffect } from "react";
import {
  CiMail,
  CiUser,
  CiLock,
  CiCamera,
  CiCalendar,
  CiBadgeDollar,
} from "react-icons/ci";
import { LuLoaderCircle, LuCheck, LuShieldCheck } from "react-icons/lu";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import {
  useChangePassword,
  useUpdateAvatar,
  useUpdateProfile,
} from "../hooks/useUser";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { updateUser } from "../store/auth/authSlice";

export default function Profile() {
  useDocumentTitle("Profile Settings");
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const fileInputRef = useRef(null);

  // Profile info state
  const [name, setName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (user?.user?.name) {
      setName(user.user.name);
    }
    if (user?.user?.avatar) {
      setAvatarPreview(user.user.avatar);
      setImgError(false);
    }
  }, [user]);

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Avatar update mutation
  const { mutate: mutateAvatar, isPending: isUploadingAvatar } = useUpdateAvatar({
    onSuccess: (data) => {
      dispatch(updateUser({ avatar: data.avatar }));
      setAvatarPreview(data.avatar);
      setImgError(false);
      toast.success("Profile photo updated successfully!");
    },
    onError: (error) => {
      const errMsg =
        error?.response?.data?.error || "Failed to upload avatar image";
      toast.error(errMsg);
    },
  });

  // Profile info update mutation
  const { mutate: mutateProfile, isPending: isSavingProfile } = useUpdateProfile({
    onSuccess: (data) => {
      dispatch(updateUser({ name: data.user.name }));
      toast.success("Profile information updated!");
    },
    onError: (error) => {
      const errMsg =
        error?.response?.data?.error || "Failed to update profile";
      toast.error(errMsg);
    },
  });

  // Password mutation
  const { mutate: mutatePassword, isPending: isChangingPassword } =
    useChangePassword({
      onSuccess: () => {
        toast.success("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      },
      onError: (error) => {
        const errMsg =
          error?.response?.data?.error || "Failed to change password";
        toast.error(errMsg);
      },
    });

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP)");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setImgError(false);
      setAvatarPreview(base64);
      mutateAvatar(base64);
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  // Handle profile info submission
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a valid name");
      return;
    }
    mutateProfile({ name: name.trim() });
  };

  // Handle password submission
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    mutatePassword(passwordData);
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const hasNameChanged = name.trim() !== (user?.user?.name || "");

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Account Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your personal profile, avatar photo, and account security
          </p>
        </div>

        {/* Profile Card Header with Avatar */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 relative">
            <div className="absolute inset-0 bg-black/5" />
          </div>

          <div className="px-6 pb-6 pt-3 relative flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4">
            {/* Avatar with Upload button */}
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5">
              <div className="relative group -mt-16 sm:-mt-14 shrink-0">
                <div className="h-28 w-28 rounded-full ring-4 ring-white shadow-md bg-gray-100 overflow-hidden relative">
                  {avatarPreview && !imgError ? (
                    <img
                      src={avatarPreview}
                      alt={user?.user?.name || "User avatar"}
                      onError={() => setImgError(true)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-3xl">
                      {user?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}

                  {/* Uploading overlay */}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs gap-1 backdrop-blur-xs">
                      <LuLoaderCircle className="w-6 h-6 animate-spin text-indigo-300" />
                      <span>Uploading...</span>
                    </div>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* Camera Click Trigger */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  aria-label="Upload profile picture"
                  className="absolute bottom-1 right-1 bg-white hover:bg-gray-100 active:scale-95 text-gray-700 p-2 rounded-full border border-gray-200 shadow-md cursor-pointer transition flex items-center justify-center disabled:opacity-50"
                  title="Upload new profile picture"
                >
                  <CiCamera className="h-5 w-5 text-gray-700 stroke-[1]" />
                </button>
              </div>

              {/* User text details */}
              <div className="text-center sm:text-left pt-1 sm:pt-0">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    {user?.user?.name || "User"}
                  </h2>
                  {user?.user?.role === "admin" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                      <LuShieldCheck className="w-3.5 h-3.5" />
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{user?.user?.email}</p>
                <div className="mt-1 flex items-center justify-center sm:justify-start gap-2 text-xs text-gray-400">
                  <span>Photo formats: JPG, PNG, WebP (Max 5MB)</span>
                </div>
              </div>
            </div>

            {/* Quick action button to pick photo */}
            <div className="flex justify-center sm:justify-end shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-xs cursor-pointer transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <CiCamera className="w-4 h-4 text-gray-600 stroke-[1]" />
                {isUploadingAvatar ? "Uploading..." : "Change Photo"}
              </button>
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <div className="grid grid-cols-1 gap-8">
          {/* Section 1: Personal Details */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 sm:p-8">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h3>
              <p className="text-sm text-gray-500">
                Update your name as it appears across your auction listings and bids
              </p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="profile-name"
                    className="block text-xs font-medium text-gray-700 mb-1.5"
                  >
                    Full Name
                  </label>
                  <div className="relative rounded-lg shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <CiUser className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      id="profile-name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                      required
                    />
                  </div>
                </div>

                {/* Email (Read-Only) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="profile-email"
                      className="block text-xs font-medium text-gray-700"
                    >
                      Email Address
                    </label>
                    <span className="text-[11px] text-gray-400 font-medium">
                      Non-editable
                    </span>
                  </div>
                  <div className="relative rounded-lg shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <CiMail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      id="profile-email"
                      value={user?.user?.email || ""}
                      disabled
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 bg-gray-50/70 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Save Profile Button */}
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={!hasNameChanged || isSavingProfile}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-sm font-semibold rounded-lg shadow-xs transition cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingProfile ? (
                    <>
                      <LuLoaderCircle className="w-4 h-4 animate-spin" />
                      Saving Name...
                    </>
                  ) : (
                    <>
                      <LuCheck className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Password Security */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 sm:p-8">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Security & Password
              </h3>
              <p className="text-sm text-gray-500">
                Ensure your account is using a long, secure password
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Current Password */}
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-xs font-medium text-gray-700 mb-1.5"
                  >
                    Current Password
                  </label>
                  <div className="relative rounded-lg shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <CiLock className="h-5 w-5" />
                    </div>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-xs font-medium text-gray-700 mb-1.5"
                  >
                    New Password
                  </label>
                  <div className="relative rounded-lg shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <CiLock className="h-5 w-5" />
                    </div>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Min 8 characters"
                      minLength={8}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                    />
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-medium text-gray-700 mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <div className="relative rounded-lg shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <CiLock className="h-5 w-5" />
                    </div>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Repeat new password"
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Update Password Button */}
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={
                    isChangingPassword ||
                    !passwordData.currentPassword ||
                    !passwordData.newPassword ||
                    !passwordData.confirmPassword
                  }
                  className="px-5 py-2.5 bg-gray-900 hover:bg-black active:scale-98 text-white text-sm font-semibold rounded-lg shadow-xs transition cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChangingPassword ? (
                    <>
                      <LuLoaderCircle className="w-4 h-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
