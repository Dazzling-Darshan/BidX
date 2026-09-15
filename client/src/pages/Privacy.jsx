import {
  CiCalendar,
  CiGlobe,
  CiMapPin,
  CiServer,
  CiMonitor,
} from "react-icons/ci";
import { Link } from "react-router";
import LoadingScreen from "../components/LoadingScreen";
import { useLoginHistory } from "../hooks/useUser";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { FaShieldAlt, FaKey, FaLock } from "react-icons/fa";

export default function Privacy() {
  useDocumentTitle("Security & Login History");
  const { data, isLoading } = useLoginHistory();

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50/70 py-8 sm:py-12">
      <main className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <FaShieldAlt className="text-indigo-600" />
            Account Protection
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Privacy & Security
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review your device login audit trail and manage security preferences.
          </p>
        </div>

        {/* Login History */}
        <div className="mb-10">
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>Recent Sign-in Activity</span>
            <span className="text-xs font-normal text-gray-400">
              ({data?.length || 0} sessions logged)
            </span>
          </h2>

          {data && data.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm hover:border-gray-300/80 transition-all"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="flex items-center text-xs">
                      <CiCalendar className="size-4 text-indigo-500 mr-2 shrink-0" />
                      <span className="font-semibold text-gray-700">Date:</span>
                      <span className="ml-1.5 text-gray-600">
                        {entry.dateTime}
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <CiGlobe className="size-4 text-indigo-500 mr-2 shrink-0" />
                      <span className="font-semibold text-gray-700">IP:</span>
                      <span className="ml-1.5 text-gray-600 font-mono">
                        {entry.ipAddress}
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <CiMapPin className="size-4 text-indigo-500 mr-2 shrink-0" />
                      <span className="font-semibold text-gray-700">Location:</span>
                      <span className="ml-1.5 text-gray-600">
                        {entry.location || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <CiServer className="size-4 text-indigo-500 mr-2 shrink-0" />
                      <span className="font-semibold text-gray-700">ISP:</span>
                      <span className="ml-1.5 text-gray-600 truncate">
                        {entry.isp || "Standard Gateway"}
                      </span>
                    </div>
                    <div className="flex items-center text-xs sm:col-span-2">
                      <CiMonitor className="size-4 text-indigo-500 mr-2 shrink-0" />
                      <span className="font-semibold text-gray-700">Device:</span>
                      <span className="ml-1.5 text-gray-600 truncate">
                        {entry.device}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200/80 p-8 text-center text-sm text-gray-500">
              No recent login history recorded.
            </div>
          )}
        </div>

        {/* Security Settings */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-3">
            Security Settings
          </h2>
          <div className="bg-white shadow-sm overflow-hidden border border-gray-200/80 rounded-2xl divide-y divide-gray-100">
            <div className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <FaLock className="text-sm" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Two-Factor Authentication (2FA)
                      </h3>
                      <span className="text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 max-w-md leading-relaxed">
                      Add an extra layer of verification to your account by
                      requiring an authenticator OTP alongside your password.
                    </p>
                  </div>
                </div>
                <div>
                  <button
                    disabled
                    className="px-4 py-2 border border-transparent text-xs font-semibold rounded-xl text-gray-400 bg-gray-100 cursor-not-allowed"
                  >
                    Enable
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <FaKey className="text-sm" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Password & Credentials
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-md leading-relaxed">
                      Update your account password regularly to keep your
                      account and active bids protected.
                    </p>
                  </div>
                </div>
                <div>
                  <Link
                    to="/profile"
                    className="inline-block px-4 py-2 border border-gray-200 text-xs font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
                  >
                    Change Password
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
