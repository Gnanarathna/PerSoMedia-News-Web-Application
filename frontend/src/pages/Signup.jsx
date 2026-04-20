import { motion as Motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import { googleLoginUser, registerUser } from "../services/authService";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@$]+@[^\s@$]+\.[^\s@$]+$/;

    if (!form.fullName.trim()) newErrors.fullName = "Name required";
    if (!emailRegex.test(form.email)) newErrors.email = "Invalid email";

    if (!form.password) newErrors.password = "Password required";
    if (form.password && form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      setMessage("");

      const payload = {
        full_name: form.fullName,
        email: form.email,
        password: form.password,
      };

      await registerUser(payload);
      navigate("/login", { state: { email: form.email } });
    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const result = await googleLoginUser(credentialResponse.credential);
      localStorage.setItem("token", result.access_token);
      navigate("/dashboard");
    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Google login failed");
    }
  };

  return (
    <Motion.div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      
      <Motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 w-[400px] shadow-2xl relative"
      >
        {/* Close */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-3 right-4 text-gray-500 text-xl"
        >
          ✕
        </button>

        <h2 className="text-3xl font-bold text-center mb-2">Sign Up</h2>
        <p className="text-center text-gray-500 mb-6">Create your account to get started</p>

        <div className="mb-4 flex justify-center rounded-2xl bg-gradient-to-r from-slate-50 via-white to-slate-50 p-2 shadow-[0_10px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
          <GoogleLogin
            locale="en"
            text="signup_with"
            theme="outline"
            shape="pill"
            size="large"
            width={320}
            logo_alignment="left"
            onSuccess={handleGoogleSuccess}
            onError={() => console.log("Google Login Failed")}
          />
        </div>

        <div className="text-center text-gray-400 mb-4">or</div>

        <form>
          {/* Inputs */}
          <div className="relative mb-1">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full rounded-lg bg-gray-100 py-3 pl-10 pr-4 outline-none"
            />
          </div>
          <p className={`text-red-500 text-sm min-h-[20px] ${errors.fullName ? "visible" : "invisible"}`}>
            {errors.fullName || "placeholder"}
          </p>

          <div className="relative mb-1">
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full rounded-lg bg-gray-100 py-3 pl-10 pr-4 outline-none"
            />
          </div>
          <p className={`text-red-500 text-sm min-h-[20px] ${errors.email ? "visible" : "invisible"}`}>
            {errors.email || "placeholder"}
          </p>

          <div className="relative mb-1">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full rounded-lg bg-gray-100 py-3 pl-10 pr-14 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </button>
          </div>
          <p className={`text-red-500 text-sm min-h-[20px] ${errors.password ? "visible" : "invisible"}`}>
            {errors.password || "placeholder"}
          </p>

          <div className="relative mb-1">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="w-full rounded-lg bg-gray-100 py-3 pl-10 pr-14 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </button>
          </div>
          <p className={`text-red-500 text-sm min-h-[20px] ${errors.confirmPassword ? "visible" : "invisible"}`}>
            {errors.confirmPassword || "placeholder"}
          </p>

          {/* Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-sm rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Please wait..." : "Sign Up"}
          </button>
          {message && (
            <p
              className={`text-center text-sm mt-3 font-medium ${
                messageType === "error" ? "text-red-500" : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}
        </form>

        {/* Link */}
        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold">Login</Link>
        </p>
      </Motion.div>
    </Motion.div>
  );
}