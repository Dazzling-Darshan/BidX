import { Link } from "react-router";
import BidXLogo from "./BidXLogo.jsx";

export const Footer = () => {
  return (
      <footer className="bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link to="/" className="inline-block group mb-1">
                <BidXLogo size="md" dark />
              </Link>
              <p className="text-gray-400 text-xs">
                Your trusted live auction marketplace
              </p>
            </div>
            <div className="flex space-x-6">
              <Link
                to="/about"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                About
              </Link>
              <Link
                to="/legal"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Legal
              </Link>
              <Link
                to="/contact"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              © 2026 BidX. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
  );
};
