import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { login } from "../store/auth/authSlice";
import { Link } from "react-router";
import LoadingScreen from "../components/LoadingScreen";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Login = () => {
  useDocumentTitle("Log In | BidX");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loading } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isError, setIsError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const errors = {
    email:
      !formData.email.trim()
        ? "Email is required"
        : !emailRegex.test(formData.email.trim())
        ? "Please enter a valid email address"
        : null,
    password: !formData.password ? "Password is required" : null,
  };

  const isValid = !errors.email && !errors.password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!isValid) return;

    try {
      await dispatch(login(formData)).unwrap();
      navigate("/");
    } catch (error) {
      console.log("Login Failed", error);
      setIsError(
        typeof error === "string"
          ? error
          : error?.message || "Invalid email or password. Please try again."
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
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-xl mb-4 text-indigo-600 shadow-sm">
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-7">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
              {touched.password && errors.password && (
                <p className="text-xs text-red-600 mt-1 font-medium">
                  {errors.password}
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
              className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-indigo-200"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="text-indigo-600 font-medium hover:text-indigo-700"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
