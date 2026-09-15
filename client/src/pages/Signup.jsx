import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "../store/auth/authSlice";
import { Link } from "react-router";
import LoadingScreen from "../components/LoadingScreen";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { FiEye, FiEyeOff, FiCheck, FiX } from "react-icons/fi";

const Signup = () => {
  useDocumentTitle("Sign Up | BidX");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isError, setIsError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Password Strength Calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass)) score++;

    if (pass.length < 8) {
      return { score: 1, label: "Weak (too short)", color: "bg-red-500" };
    }
    if (score <= 2) {
      return { score: 2, label: "Fair", color: "bg-amber-500" };
    }
    if (score === 3) {
      return { score: 3, label: "Good", color: "bg-blue-500" };
    }
    return { score: 4, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(formData.password);

  // Field validations
  const errors = {
    name:
      !formData.name.trim()
        ? "Full name is required"
        : formData.name.trim().length < 2
        ? "Name must be at least 2 characters"
        : null,
    email:
      !formData.email.trim()
        ? "Email is required"
        : !emailRegex.test(formData.email.trim())
        ? "Please enter a valid email address"
        : null,
    password:
      !formData.password
        ? "Password is required"
        : formData.password.length < 8
        ? "Password must be at least 8 characters"
        : null,
    confirmPassword:
      !formData.confirmPassword
        ? "Please confirm your password"
        : formData.confirmPassword !== formData.password
        ? "Passwords do not match"
        : null,
  };

  const isValid =
    !errors.name && !errors.email && !errors.password && !errors.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!isValid) return;

    try {
      // Backend expects name, email, password
      await dispatch(
        signup({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        })
      ).unwrap();
      navigate("/");
    } catch (error) {
      console.log("Signup Failed", error);
      setIsError(
        typeof error === "string"
          ? error
          : error?.message || "Failed to create account. Please try again."
      );
      setTimeout(() => {
        setIsError("");
      }, 8000);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl mb-4 text-emerald-600 shadow-sm">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create an account
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Join the auction community
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-7">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition text-sm ${
                  touched.name && errors.name
                    ? "border-red-300 focus:ring-red-500/30 focus:border-red-400 bg-red-50/20"
                    : "border-gray-200 focus:ring-indigo-500/40 focus:border-indigo-400"
                }`}
                placeholder="John Doe"
                required
              />
              {touched.name && errors.name && (
                <p className="text-xs text-red-600 mt-1 font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition text-sm ${
                  touched.email && errors.email
                    ? "border-red-300 focus:ring-red-500/30 focus:border-red-400 bg-red-50/20"
                    : "border-gray-200 focus:ring-indigo-500/40 focus:border-indigo-400"
                }`}
                placeholder="you@example.com"
                required
              />
              {touched.email && errors.email && (
                <p className="text-xs text-red-600 mt-1 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                  className={`w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition text-sm ${
                    touched.password && errors.password
                      ? "border-red-300 focus:ring-red-500/30 focus:border-red-400 bg-red-50/20"
                      : "border-gray-200 focus:ring-indigo-500/40 focus:border-indigo-400"
                  }`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">Strength:</span>
                    <span className="font-semibold text-gray-700">
                      {strength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 h-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`rounded-full h-full transition-all duration-300 ${
                          strength.score >= level
                            ? strength.color
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {touched.password && errors.password && (
                <p className="text-xs text-red-600 mt-1 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  onBlur={() =>
                    setTouched((p) => ({ ...p, confirmPassword: true }))
                  }
                  className={`w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition text-sm ${
                    touched.confirmPassword && errors.confirmPassword
                      ? "border-red-300 focus:ring-red-500/30 focus:border-red-400 bg-red-50/20"
                      : "border-gray-200 focus:ring-indigo-500/40 focus:border-indigo-400"
                  }`}
                  placeholder="••••••••"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {formData.confirmPassword && (
                    formData.confirmPassword === formData.password ? (
                      <FiCheck className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <FiX className="w-4 h-4 text-red-500" />
                    )
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1 font-medium">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {isError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm p-3.5 rounded-xl font-medium">
                {isError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-emerald-200 mt-2"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-medium hover:text-indigo-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
