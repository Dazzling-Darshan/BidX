import { Link } from "react-router";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import {
  FaShieldAlt,
  FaFileContract,
  FaCopyright,
  FaUserCheck,
  FaHandshake,
  FaArrowRight,
} from "react-icons/fa";

export default function Legal() {
  useDocumentTitle("Legal Documents");

  const legalPages = [
    {
      title: "Privacy Policy",
      icon: <FaShieldAlt className="text-indigo-600 text-lg" />,
      bg: "bg-indigo-50 border-indigo-100",
      description:
        "Learn how we collect, use, and protect your personal information and bidding telemetry.",
      to: "/legal/privacy-policy",
    },
    {
      title: "Terms of Service",
      icon: <FaFileContract className="text-emerald-600 text-lg" />,
      bg: "bg-emerald-50 border-emerald-100",
      description:
        "The terms, conditions, and legal obligations governing your use of our auction platform.",
      to: "/legal/terms-of-service",
    },
    {
      title: "DMCA Policy",
      icon: <FaCopyright className="text-amber-600 text-lg" />,
      bg: "bg-amber-50 border-amber-100",
      description:
        "Notice and procedure for copyright infringement claims and intellectual property protection.",
      to: "/legal/dmca",
    },
    {
      title: "Code of Conduct",
      icon: <FaHandshake className="text-violet-600 text-lg" />,
      bg: "bg-violet-50 border-violet-100",
      description:
        "Community standards and fair-bidding guidelines for buyers and sellers across the platform.",
      to: "/legal/code-of-conduct",
    },
    {
      title: "Acceptable Use Policy",
      icon: <FaUserCheck className="text-sky-600 text-lg" />,
      bg: "bg-sky-50 border-sky-100",
      description:
        "Clear rules about permissible activities, prohibited items, and platform integrity.",
      to: "/legal/acceptable-use-policy",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/70 py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3.5 py-1 rounded-full mb-4">
            Compliance & Transparency
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Legal & Trust Center
          </h1>
          <p className="text-base text-gray-500 leading-relaxed">
            Please review our platform guidelines and policies to understand
            your rights, responsibilities, and security protections when bidding
            or selling on BidX.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {legalPages.map((page) => (
            <Link
              key={page.to}
              to={page.to}
              className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between group"
            >
              <div>
                <div
                  className={`w-10 h-10 rounded-xl border ${page.bg} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}
                >
                  {page.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {page.title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  {page.description}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                <span>Read policy</span>
                <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Questions Box */}
        <div className="mt-12 bg-gradient-to-r from-indigo-900 to-indigo-950 text-white rounded-2xl p-8 sm:p-10 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold mb-2">
              Have questions about our terms?
            </h2>
            <p className="text-xs text-indigo-200 max-w-lg leading-relaxed">
              Our support and compliance team is available to assist with any
              inquiries regarding intellectual property, privacy, or policy clarifications.
            </p>
          </div>
          <Link
            to="/contact"
            className="px-5 py-2.5 bg-white text-indigo-950 rounded-xl text-xs font-bold hover:bg-indigo-50 transition shadow-sm shrink-0"
          >
            Contact Compliance
          </Link>
        </div>
      </div>
    </div>
  );
}
