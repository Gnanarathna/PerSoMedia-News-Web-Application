import { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PrivateNavbar from "../components/PrivateNavbar";
import {
  FaUserCircle,
  FaCamera,
  FaTrashAlt,
} from "react-icons/fa";
import {
  getCurrentUser,
  updateProfile,
  changePassword,
  uploadProfilePhoto,
  deleteAccount,
  forgotPassword,
} from "../services/authService";
import { useUser } from "../context/useUser";

export default function AccountSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  
  // Use global user context to trigger navbar updates
  const { refreshUser } = useUser();

  // Profile Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [hasOriginalImage, setHasOriginalImage] = useState(false);
  const [isPhotoPreviewOpen, setIsPhotoPreviewOpen] = useState(false);

  // Password Form States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmationEmail, setDeleteConfirmationEmail] = useState("");
  const [deleteError, setDeleteError] = useState(null);
  const googleAccountSecurityUrl = "https://myaccount.google.com/security";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setFullName(userData.name || "");
        setEmail(userData.email || "");
        setPreviewImage(userData.image || null);
        // Track if user has an original image - this should never change
        setHasOriginalImage(!!userData.image);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setImageError(false);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPhoto = async () => {
    if (!profileImage) return;

    setIsUploadingPhoto(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await uploadProfilePhoto(profileImage);
      // Add cache buster to image URL to prevent browser caching
      const imageUrlWithTimestamp = `${response.image_url}?t=${Date.now()}`;
      setUser((prev) => ({ ...prev, image: imageUrlWithTimestamp }));
      setPreviewImage(imageUrlWithTimestamp);
      setHasOriginalImage(true);
      setProfileImage(null);
      setImageError(false);
      // Refresh user in global context (updates navbar instantly)
      await refreshUser();
      setSuccess("Profile photo uploaded successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const trimmedName = fullName.trim();

    if (!trimmedName) {
      setError("Name is required");
      setIsSaving(false);
      return;
    }

    if (trimmedName.length > 20) {
      setError("Name must be 20 characters or fewer including spaces");
      setIsSaving(false);
      return;
    }

    try {
      const response = await updateProfile({
        name: trimmedName,
      });
      setUser((prev) => ({ ...prev, ...response }));
      // Preserve and update the profile picture
      if (response.image) {
        setPreviewImage(response.image);
      }
      // Refresh user in global context (updates navbar instantly)
      await refreshUser();
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const validatePasswordFields = (old, newPass, confirmPass) => {
    const errors = {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    // Check new password and confirm password match
    if (newPass && confirmPass && newPass !== confirmPass) {
      errors.confirmPassword = "Passwords are not matching";
    }

    // Check if new password is same as old password
    if (old && newPass && old === newPass) {
      errors.newPassword = "Do not enter existing password";
    }

    setPasswordErrors(errors);
    return errors;
  };

  const handleOldPasswordChange = (value) => {
    setOldPassword(value);
    const errors = validatePasswordFields(value, newPassword, confirmPassword);
    setPasswordErrors(errors);
  };

  const handleNewPasswordChange = (value) => {
    setNewPassword(value);
    const errors = validatePasswordFields(oldPassword, value, confirmPassword);
    setPasswordErrors(errors);
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    const errors = validatePasswordFields(oldPassword, newPassword, value);
    setPasswordErrors(errors);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Clear previous errors
    setPasswordErrors({ oldPassword: "", newPassword: "", confirmPassword: "" });

    // Validation checks
    if (!oldPassword) {
      setPasswordErrors(prev => ({ ...prev, oldPassword: "Current password is required" }));
      return;
    }

    if (!newPassword) {
      setPasswordErrors(prev => ({ ...prev, newPassword: "New password is required" }));
      return;
    }

    if (!confirmPassword) {
      setPasswordErrors(prev => ({ ...prev, confirmPassword: "Confirm password is required" }));
      return;
    }

    if (newPassword.length < 6) {
      setPasswordErrors(prev => ({ ...prev, newPassword: "Must be at least 6 characters" }));
      return;
    }

    if (oldPassword === newPassword) {
      setPasswordErrors(prev => ({ ...prev, newPassword: "Do not enter existing password" }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrors(prev => ({ ...prev, confirmPassword: "Passwords are not matching" }));
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setSuccess("Password changed successfully!");
    } catch (err) {
      // Check if error is about incorrect current password
      if (err.message.includes("Incorrect") || err.message.includes("password")) {
        setPasswordErrors(prev => ({ ...prev, oldPassword: "Current password is incorrect" }));
      } else {
        setError(err.message);
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);

    if (user?.auth_provider === "google") {
      if (!deleteConfirmationEmail.trim()) {
        setDeleteError("Please enter your Google account email to confirm deletion");
        return;
      }

      if (deleteConfirmationEmail.trim().toLowerCase() !== (email || "").trim().toLowerCase()) {
        setDeleteError("Confirmation email does not match your Google account email");
        return;
      }
    } else {
      if (!deletePassword) {
        setDeleteError("Please enter your current password to delete your account");
        return;
      }
    }

    // First, validate the password/email without deleting
    setIsDeletingAccount(true);
    setError(null);

    try {
      await deleteAccount({
        password: user?.auth_provider === "google" ? undefined : deletePassword,
        confirmation_email:
          user?.auth_provider === "google" ? deleteConfirmationEmail.trim() : undefined,
        validate_only: true,
      });

      // Password is correct, now show confirmation popup
      const confirmDelete = window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      );
      if (!confirmDelete) {
        setIsDeletingAccount(false);
        return;
      }

      // User confirmed, now actually delete the account
      await deleteAccount({
        password: user?.auth_provider === "google" ? undefined : deletePassword,
        confirmation_email:
          user?.auth_provider === "google" ? deleteConfirmationEmail.trim() : undefined,
        validate_only: false,
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    } catch (err) {
      setDeleteError(err.message);
      setIsDeletingAccount(false);
    }
  };

  const handleOpenGoogleAccountSecurity = () => {
    window.open(googleAccountSecurityUrl, "_blank", "noopener,noreferrer");
  };

  const handleSendResetEmail = async () => {
    if (!email) return;
    setIsSendingResetEmail(true);
    setError(null);
    try {
      await forgotPassword(email);
      setResetEmailSent(true);
      setSuccess("Password reset link has been sent to your email!");
      // Reset the message after 5 seconds
      setTimeout(() => {
        setResetEmailSent(false);
      }, 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <PrivateNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <PrivateNavbar />

      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-5xl px-4 py-8"
      >
        <h1 className="mb-6 text-2xl sm:text-3xl font-bold text-slate-800">Account Settings</h1>

        {/* Alert Messages */}
        {error && (
          <Motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600"
          >
            {error}
          </Motion.div>
        )}
        {success && (
          <Motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-600"
          >
            {success}
          </Motion.div>
        )}

        {/* Main Settings Layout */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Profile Picture */}
          <Motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="rounded-2xl border border-blue-200 bg-white p-4 sm:p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-bold text-slate-800">Profile Picture</h3>
              {/* Profile Image */}
              <div className="mb-6 flex flex-col items-center">
                <Motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    type="button"
                    onClick={() => setIsPhotoPreviewOpen(true)}
                    className="block rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    aria-label="Preview profile picture"
                  >
                  {previewImage && !imageError ? (
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="h-40 w-40 rounded-full border-4 border-blue-200 object-cover"
                      onError={() => {
                        console.error("Image failed to load:", previewImage);
                        setImageError(true);
                      }}
                      onLoad={() => {
                        console.log("Image loaded successfully:", previewImage);
                      }}
                    />
                  ) : hasOriginalImage && imageError ? (
                    // User had a picture but it failed to load - show placeholder
                    <div className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-blue-200 bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="text-center">
                        <FaUserCircle className="text-6xl text-gray-400" />
                      </div>
                    </div>
                  ) : !hasOriginalImage ? (
                    // User never had a picture - show initials
                    <div className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-blue-200 bg-gradient-to-br from-blue-100 to-blue-200">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600">
                          {fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <p className="text-xs text-blue-500 mt-1">
                          {fullName.split(" ")[0]}
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Loading state
                    <div className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-blue-200 bg-blue-50">
                      <Motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-600"
                      />
                    </div>
                  )}
                  </button>
                  <label className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-lg transition hover:bg-blue-700">
                    <FaCamera className="text-sm" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                </Motion.div>

                {profileImage && (
                  <div className="mt-4 flex gap-2">
                    <Motion.button
                      onClick={handleUploadPhoto}
                      disabled={isUploadingPhoto}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isUploadingPhoto ? "Uploading..." : "Upload"}
                    </Motion.button>
                    <Motion.button
                      onClick={() => {
                        setProfileImage(null);
                        setPreviewImage(user?.image || null);
                      }}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </Motion.button>
                  </div>
                )}

                {!profileImage && (
                  <p className="mt-4 text-center text-sm text-slate-500">
                    <span className="block font-medium text-slate-700">Current Picture</span>
                    Click the camera icon to change your profile photo
                  </p>
                )}
              </div>
            </div>
          </Motion.div>

          {/* Right Column - Forms */}
          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Profile Information Form */}
            <div className="rounded-2xl border border-blue-200 bg-white p-4 sm:p-6 shadow-lg">
              <h2 className="mb-2 text-xl font-bold text-slate-800">Profile Information</h2>
              <p className="mb-6 text-sm text-slate-500">Update your name and profile picture. Your current profile picture will be preserved while you make changes.</p>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-slate-600">
                    {email}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Email cannot be changed</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Motion.button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Motion.button>
                  <Motion.button
                    type="button"
                    onClick={() => navigate("/profile")}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-600 transition hover:bg-slate-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </Motion.button>
                </div>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="rounded-2xl border border-blue-200 bg-white p-4 sm:p-6 shadow-lg">
              <h2 className="mb-6 text-xl font-bold text-slate-800">Change Password</h2>

              {user?.auth_provider === "google" ? (
                <Motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                    <p className="text-sm text-slate-700 mb-3">
                      Your account is connected to Google. To change your password, please use your Google Account settings.
                    </p>
                    <p className="text-xs text-slate-600 mb-4">
                      ⚠️ <strong>Important:</strong> When you change your Google Account password, you will be logged out of all active sessions for security purposes. You'll need to sign in again with your new password.
                    </p>
                    <Motion.button
                      type="button"
                      onClick={handleOpenGoogleAccountSecurity}
                      className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Go to Google Account Security
                    </Motion.button>
                  </div>
                </Motion.div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Current Password
                      </label>
                      <Motion.button
                        type="button"
                        onClick={handleSendResetEmail}
                        disabled={isSendingResetEmail || resetEmailSent}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {resetEmailSent ? "Email Sent ✓" : "Forgot Password?"}
                      </Motion.button>
                    </div>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => handleOldPasswordChange(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    {passwordErrors.oldPassword && (
                      <p className="mt-1 text-xs text-red-600">{passwordErrors.oldPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => handleNewPasswordChange(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-xs text-red-600">{passwordErrors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  <Motion.button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isChangingPassword ? "Updating..." : "Update Password"}
                  </Motion.button>
                </form>
              )}
            </div>

            {/* Delete Account Section */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-lg"
            >
              <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-red-600">
                <FaTrashAlt /> Danger Zone
              </h2>
              <p className="mb-4 text-sm text-red-600">
                Permanently delete your account and all associated data. This action cannot be
                undone.
              </p>

              {deleteError && (
                <div className="mb-4 rounded-lg border border-red-300 bg-white p-3 text-sm text-red-700">
                  {deleteError}
                </div>
              )}

              {user?.auth_provider === "google" ? (
                <div className="mb-4 space-y-3">
                  <p className="text-xs text-red-600">
                    This is a Google-connected account. Enter your Google account email to confirm deletion.
                  </p>
                  <input
                    type="email"
                    value={deleteConfirmationEmail}
                    onChange={(e) => {
                      setDeleteConfirmationEmail(e.target.value);
                      if (deleteError) setDeleteError(null);
                    }}
                    placeholder="Enter your Google account email"
                    className="w-full rounded-lg border border-red-200 bg-white px-4 py-2 text-slate-700 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-200"
                  />
                  <button
                    type="button"
                    onClick={handleOpenGoogleAccountSecurity}
                    className="text-sm font-bold text-red-700 hover:text-red-800 hover:underline"
                  >
                    Manage Google Account Security
                  </button>
                </div>
              ) : (
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-red-700">
                    Current Password (required)
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value);
                      if (deleteError) setDeleteError(null);
                    }}
                    placeholder="Enter your current password"
                    className="w-full rounded-lg border border-red-200 bg-white px-4 py-2 text-slate-700 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-200"
                  />
                </div>
              )}

              <Motion.button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="rounded-lg border border-red-600 bg-white px-4 py-2 font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isDeletingAccount ? "Deleting..." : "Delete Account"}
              </Motion.button>
            </Motion.div>
          </Motion.div>
        </div>
      </Motion.div>

      {isPhotoPreviewOpen && previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4"
          onClick={() => setIsPhotoPreviewOpen(false)}
        >
          <Motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl rounded-2xl border border-white/20 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Profile Picture</h3>
              <button
                type="button"
                onClick={() => setIsPhotoPreviewOpen(false)}
                className="rounded-full px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                Close
              </button>
            </div>
            <div className="flex justify-center">
              <img
                src={previewImage}
                alt="Profile preview"
                className="w-full max-h-64 sm:max-h-96 rounded-2xl object-cover shadow-md"
              />
            </div>
            <p className="mt-4 text-center text-sm text-slate-500">
              Preview of your current profile photo
            </p>
          </Motion.div>
        </div>
      )}
    </div>
  );
}
