import React from "react";
import {
  FaBolt,
  FaRobot,
  FaShieldAlt,
  FaSearch,
  FaEye,
  FaGavel,
} from "react-icons/fa";

const features = [
  {
    icon: <FaBolt className="text-xl text-amber-600" />,
    bg: "bg-amber-50 border-amber-100",
    title: "Real-Time Live Bids",
    desc: "Instant bi-directional bid synchronization powered by WebSockets. Experience real-time price updates with zero manual refreshes.",
  },
  {
    icon: <FaRobot className="text-xl text-violet-600" />,
    bg: "bg-violet-50 border-violet-100",
    title: "AI Vision Auto-Listing",
    desc: "Simply upload a product photo. Google Gemini Vision automatically detects item title, category, starting price, and appraisal description.",
  },
  {
    icon: <FaSearch className="text-xl text-indigo-600" />,
    bg: "bg-indigo-50 border-indigo-100",
    title: "Semantic Vector Search",
    desc: "Discover relevant items with mathematical vector embeddings. Cosine similarity matches recommendations to user intent.",
  },
  {
    icon: <FaGavel className="text-xl text-emerald-600" />,
    bg: "bg-emerald-50 border-emerald-100",
    title: "Smart Custom Bidding",
    desc: "Choose fast 1-click bid increment presets or enter your exact custom valuation with concurrency race condition prevention.",
  },
  {
    icon: <FaEye className="text-xl text-sky-600" />,
    bg: "bg-sky-50 border-sky-100",
    title: "Live Watchers & Alerts",
    desc: "See who is currently active in the auction room in real-time and receive instant notifications when someone outbids you.",
  },
  {
    icon: <FaShieldAlt className="text-xl text-rose-600" />,
    bg: "bg-rose-50 border-rose-100",
    title: "Secure & Fair Marketplace",
    desc: "HttpOnly JWT authentication, atomic database operations, and seller self-bidding restrictions guarantee honest auctions.",
  },
];

export const Features = () => {
  return (
    <section className="py-20 sm:py-24 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-indigo-600 font-bold text-xs uppercase tracking-wider mb-2">
            Cutting-Edge Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Built for Serious Bidders & Sellers
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base">
            Every feature is engineered for high concurrency, fair price
            discovery, and effortless auction management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="relative bg-gray-50/50 hover:bg-white rounded-2xl border border-gray-200/80 p-7 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col justify-between"
            >
              <div>
                <div
                  className={`${f.bg} w-12 h-12 rounded-xl border flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}
                >
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
