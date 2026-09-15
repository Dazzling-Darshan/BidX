import { Link } from "react-router";
import BidXLogo from "./BidXLogo.jsx";
import { FaGithub, FaHeart } from "react-icons/fa";

export const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-400 border-t border-gray-800/80 pt-12 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="inline-block group">
              <BidXLogo size="md" dark />
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              Real-time online auction ecosystem featuring live WebSocket bid
              sync, Google Gemini Vision listing automation, and semantic vector
              discovery.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All Systems Operational
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to="/auction"
                  className="hover:text-white transition-colors"
                >
                  Explore Live Auctions
                </Link>
              </li>
              <li>
                <Link
                  to="/auction?sortBy=endingSoon"
                  className="hover:text-white transition-colors"
                >
                  Ending Soon
                </Link>
              </li>
              <li>
                <Link
                  to="/my-bids"
                  className="hover:text-white transition-colors"
                >
                  My Placed Bids
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">
              Legal & Trust
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to="/legal/terms-of-service"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/privacy-policy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/dmca"
                  className="hover:text-white transition-colors"
                >
                  DMCA Notice
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/code-of-conduct"
                  className="hover:text-white transition-colors"
                >
                  Code of Conduct
                </Link>
              </li>
              <li>
                <Link
                  to="/legal"
                  className="hover:text-white transition-colors text-indigo-400"
                >
                  All Legal Documents &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Connect */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">
              Platform & Support
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About BidX & Architecture
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact Support
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/Dazzling-Darshan/auction-platform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <FaGithub className="text-sm" />
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-gray-500">
            &copy; {new Date().getFullYear()} BidX Auctions. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-gray-500">
            <span>Engineered with</span>
            <FaHeart className="text-rose-500 text-[10px]" />
            <span>by</span>
            <a
              href="https://github.com/Dazzling-Darshan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white font-medium underline underline-offset-2"
            >
              Darshan Prajapati
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
