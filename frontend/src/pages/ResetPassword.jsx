import { useState } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/authService";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-6 sm:p-8 shadow-lg text-center w-full max-w-md"
          >
            <div className="mb-4 text-4xl text-red-500">✗</div>
            <h2 className="mb-2 text-2xl font-bold text-slate-800">Invalid Link</h2>
            <p className="mb-6 text-slate-600">
              The password reset link is missing or invalid.
            </p>
            <Motion.button
              onClick={() => navigate("/forgot-password")}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Request New Link
            </Motion.button>
          </Motion.div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-6 sm:p-8 shadow-lg text-center w-full max-w-md"
          >
            <div className="mb-4 text-4xl text-green-500">✓</div>
            <h2 className="mb-2 text-2xl font-bold text-slate-800">Password Reset</h2>
            <p className="mb-6 text-slate-600">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <Motion.button
              onClick={() => navigate("/login")}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Go to Login
            </Motion.button>
          </Motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-blue-200 bg-white p-6 sm:p-8 shadow-lg"
        >
          <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-slate-800">Reset Password</h1>
          <p className="mb-6 text-slate-600">
            Enter your new password below.
          </p>

          {error && (
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600"
            >
              {error}
            </Motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <Motion.button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Motion.button>
          </form>
        </Motion.div>
      </div>
    </div>
  );
}
