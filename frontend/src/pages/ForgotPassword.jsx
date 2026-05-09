import { useState } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { forgotPassword } from "../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await forgotPassword(email);
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
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-8 shadow-lg text-center max-w-md"
          >
            <div className="mb-4 text-4xl text-green-500">✓</div>
            <h2 className="mb-2 text-2xl font-bold text-slate-800">Check Your Email</h2>
            <p className="mb-6 text-slate-600">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="mb-6 text-sm text-slate-500">
              The link will expire in 1 hour. If you don't see the email, check your spam folder.
            </p>
            <Motion.button
              onClick={() => navigate("/login")}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to Login
            </Motion.button>
          </Motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-blue-200 bg-white p-8 shadow-lg"
        >
          <Link
            to="/login"
            className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <FaArrowLeft />
            Back to Login
          </Link>

          <h1 className="mb-2 text-3xl font-bold text-slate-800">Forgot Password?</h1>
          <p className="mb-6 text-slate-600">
            Enter your email address and we'll send you a link to reset your password.
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
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
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
              {loading ? "Sending..." : "Send Reset Link"}
            </Motion.button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-600">
            Remember your password?{" "}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Sign In
            </Link>
          </p>
        </Motion.div>
      </div>
    </div>
  );
}
