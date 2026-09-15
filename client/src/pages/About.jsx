import { Link } from "react-router";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import {
  FaGavel,
  FaBolt,
  FaRobot,
  FaShieldAlt,
  FaSearch,
  FaBell,
  FaGithub,
  FaCode,
  FaCheckCircle,
  FaExternalLinkAlt,
} from "react-icons/fa";

export const About = () => {
  useDocumentTitle("About BidX");

  const architectureHighlights = [
    {
      icon: <FaBolt className="text-amber-500 text-xl" />,
      bg: "bg-amber-50 border-amber-100",
      title: "Real-Time WebSocket Sync",
      desc: "Instant live bid broadcasts, dynamic active viewer presence, and real-time outbid notifications powered by Socket.io rooms.",
      stat: "< 50ms",
      statLabel: "Bid propagation latency",
    },
    {
      icon: <FaRobot className="text-violet-600 text-xl" />,
      bg: "bg-violet-50 border-violet-100",
      title: "Google Gemini AI Vision",
      desc: "Intelligent auction listing generator. Analyzes uploaded item photos to automatically deduce item title, category, price, and descriptions.",
      stat: "4 Fallback Models",
      statLabel: "Zero downtime AI resilience",
    },
    {
      icon: <FaSearch className="text-indigo-600 text-xl" />,
      bg: "bg-indigo-50 border-indigo-100",
      title: "Semantic Vector Search",
      desc: "AI vector embeddings calculated via Google Gemini embedding models and indexed with cosine similarity for intelligent related item recommendations.",
      stat: "Cosine Vector",
      statLabel: "Mathematical similarity ranking",
    },
    {
      icon: <FaShieldAlt className="text-emerald-600 text-xl" />,
      bg: "bg-emerald-50 border-emerald-100",
      title: "Granular Security & RBAC",
      desc: "JWT-based authentication stored in secure HttpOnly cookies, MongoDB concurrency locking for price races, and full admin moderation.",
      stat: "Atomic Locks",
      statLabel: "Anti-concurrency protection",
    },
  ];

  const techStack = [
    {
      category: "Frontend Layer",
      techs: [
        { name: "React 19", role: "Component UI Library" },
        { name: "Vite", role: "Next-gen Fast Bundler" },
        { name: "Tailwind CSS v4", role: "Modern Design System" },
        { name: "Redux Toolkit", role: "Global Auth & State" },
        { name: "TanStack React Query", role: "Server Cache & Mutations" },
        { name: "Socket.io Client", role: "Bi-directional Live Stream" },
      ],
    },
    {
      category: "Backend & Database",
      techs: [
        { name: "Node.js & Express", role: "High-throughput REST API" },
        { name: "MongoDB & Mongoose", role: "Document Store with Schemas" },
        { name: "Socket.io Server", role: "Live Auction Rooms & Events" },
        { name: "JWT & Bcrypt", role: "HttpOnly Auth & Password Hashing" },
      ],
    },
    {
      category: "AI & Cloud Services",
      techs: [
        { name: "Google Gemini Vision", role: "Automated Item Appraising" },
        { name: "Gemini Text Embeddings", role: "Semantic Vector Similarity" },
        { name: "Cloudinary CDN", role: "Signed Media Storage & Transform" },
        { name: "Resend", role: "Transactional Email Engine" },
      ],
    },
  ];

  const coreFeatures = [
    {
      title: "Dynamic Bid increments & Custom Bidding",
      desc: "Flexible bidding engine allowing users to select quick +1, +5, +10 INR increments or submit precise custom amounts.",
    },
    {
      title: "Real-Time Watchers & Live Presence",
      desc: "Socket room tracking ensures active viewers and user presence are shown accurately with instant leave/join broadcasts.",
    },
    {
      title: "Active Auction Isolation",
      desc: "Ended auctions are segregated automatically so buyers explore only live items, while sellers retain their complete sales history.",
    },
    {
      title: "Interactive User Watchlist",
      desc: "Track high-interest items with countdown timers, instant price updates, and quick access from your personal dashboard.",
    },
    {
      title: "Role-Based Admin Control Center",
      desc: "Admins inspect platform health, moderate live auctions, manage user roles, and review customer inquiries securely.",
    },
    {
      title: "Geographic Login Audit Trail",
      desc: "Every login captures IP and location telemetry to alert users of unusual sign-in activity.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/70">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-950 to-gray-950 text-white py-20 sm:py-24">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            About BidX Real-Time Marketplace
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            Next-Generation Live Auctions, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-amber-300">
              Powered by WebSockets & AI
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-indigo-200/80 leading-relaxed">
            BidX is an open, high-performance auction marketplace engineered
            for sub-second bid distribution, multi-model AI cataloging, and
            transparent digital commerce.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        {/* Architecture Highlights */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
              Engineered for Performance
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Core Architectural Pillars
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Designed from the ground up to prevent race conditions and provide
              an instantaneous auction room experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {architectureHighlights.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border ${item.bg}`}
                    >
                      {item.icon}
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                      Pillar #{idx + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-extrabold text-indigo-600">
                      {item.stat}
                    </div>
                    <div className="text-xs text-gray-400 font-medium">
                      {item.statLabel}
                    </div>
                  </div>
                  <FaCheckCircle className="text-emerald-500 text-base" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-12 shadow-sm">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Platform Features
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
              Everything Needed for Seamless Auctions
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feat, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-indigo-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold text-xs mb-3">
                  0{i + 1}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1.5">
                  {feat.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack Breakdown */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
              Full Spectrum Engineering
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Modern Technology Stack
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Built with industry-standard frameworks and high-resilience cloud services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {techStack.map((col, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm flex flex-col"
              >
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
                  <FaCode className="text-indigo-600 text-sm" />
                  {col.category}
                </h3>
                <ul className="space-y-3 flex-1">
                  {col.techs.map((tech, tIdx) => (
                    <li
                      key={tIdx}
                      className="flex items-center justify-between text-xs py-1"
                    >
                      <span className="font-semibold text-gray-800">
                        {tech.name}
                      </span>
                      <span className="text-gray-400 font-medium text-[11px] bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        {tech.role}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Developer / Project Credits */}
        <div className="bg-gradient-to-br from-indigo-900 to-violet-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-indigo-200 backdrop-blur-sm">
                <span>👨‍💻</span> Built with Passion
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold">
                Developed by Darshan Prajapati
              </h3>
              <p className="text-sm text-indigo-200/80 leading-relaxed">
                BidX is designed and crafted as a production-grade full-stack project,
                exploring real-time distributed state, generative AI workflows,
                and scalable REST API design.
              </p>
              <div className="flex flex-wrap gap-3 pt-2 justify-center md:justify-start">
                <a
                  href="https://github.com/Dazzling-Darshan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-xl text-xs font-semibold hover:bg-gray-100 transition shadow-sm"
                >
                  <FaGithub className="text-sm" />
                  GitHub Profile
                  <FaExternalLinkAlt className="text-[10px] text-gray-400" />
                </a>
                <a
                  href="https://github.com/Dazzling-Darshan/auction-platform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition border border-white/10"
                >
                  <FaCode className="text-sm" />
                  Source Code
                  <FaExternalLinkAlt className="text-[10px] text-indigo-300" />
                </a>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 text-center shrink-0 w-full sm:w-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-400 flex items-center justify-center text-2xl font-bold text-gray-950 mx-auto mb-3 shadow-lg">
                DP
              </div>
              <div className="text-base font-bold text-white">
                Darshan Prajapati
              </div>
              <div className="text-xs text-indigo-200 mb-4">
                Full-Stack Software Engineer
              </div>
              <Link
                to="/contact"
                className="inline-block w-full py-2 px-4 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl transition shadow-sm"
              >
                Send Message
              </Link>
            </div>
          </div>
        </div>

        {/* Support & Contact Footer */}
        <div className="text-center py-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Have questions, feedback, or found an issue? We'd love to hear from you.{" "}
            <Link
              to="/contact"
              className="text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-4"
            >
              Reach out via our Contact Page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};
