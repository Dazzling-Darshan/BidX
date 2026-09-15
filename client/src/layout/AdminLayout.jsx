import { useEffect, useState } from "react";
import { Outlet, useNavigate, NavLink, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import LoadingScreen from "../components/LoadingScreen";
import ScrollToTop from "../utils/ScrollToTop";
import { getAdminDashboard } from "../services/admin.service.js";
import {
  MdOutlineDashboard,
  MdOutlinePeople,
  MdOutlineGavel,
  MdOutlineMail,
  MdOutlineAdminPanelSettings,
} from "react-icons/md";

export const AdminLayout = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login");
      } else if (user?.user?.role !== "admin") {
        navigate("/");
      }
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user?.user?.role === "admin") {
      getAdminDashboard()
        .then((data) => {
          if (data?.stats?.unreadMessages != null) {
            setUnreadCount(data.stats.unreadMessages);
          }
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  if (loading) return <LoadingScreen />;
  if (!user || user?.user?.role !== "admin") return null;

  const navItems = [
    { to: "/admin", label: "Overview", icon: MdOutlineDashboard, end: true },
    { to: "/admin/users", label: "Users", icon: MdOutlinePeople },
    { to: "/admin/auctions", label: "Auctions", icon: MdOutlineGavel },
    {
      to: "/admin/messages",
      label: "Inquiries",
      icon: MdOutlineMail,
      badge: unreadCount > 0 ? unreadCount : null,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/60 flex flex-col">
      <ScrollToTop />
      <Navbar />

      {/* Admin Sub-Navigation Header */}
      <div className="bg-white border-b border-gray-200/80 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 sm:py-0 gap-3">
            {/* Admin Title & Status Badge */}
            <div className="flex items-center gap-2.5 py-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                <MdOutlineAdminPanelSettings className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900 tracking-tight">
                    Admin Portal
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-100 text-violet-700">
                    Administrator
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 px-3.5 py-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-all ${
                        isActive
                          ? "border-indigo-600 text-indigo-600 bg-indigo-50/40"
                          : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        <Outlet context={{ unreadCount, setUnreadCount }} />
      </div>

      <Footer />
    </div>
  );
};