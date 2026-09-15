import PropTypes from "prop-types";

export const BidXLogo = ({
  size = "md",
  showWordmark = true,
  dark = false,
  className = "",
}) => {
  const sizeMap = {
    sm: {
      badge: "w-8 h-8 rounded-lg",
      svg: "w-4 h-4",
      text: "text-base",
      gap: "gap-2",
    },
    md: {
      badge: "w-9 h-9 sm:w-10 sm:h-10 rounded-xl",
      svg: "w-5 h-5 sm:w-5.5 sm:h-5.5",
      text: "text-lg sm:text-xl",
      gap: "gap-2.5",
    },
    lg: {
      badge: "w-12 h-12 rounded-2xl",
      svg: "w-7 h-7",
      text: "text-2xl",
      gap: "gap-3",
    },
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center ${current.gap} select-none ${className}`}>
      {/* Icon Badge */}
      <div
        className={`${current.badge} bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25 ring-1 ring-white/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-indigo-500/40 relative overflow-hidden`}
      >
        {/* Subtle highlight sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />

        {/* Vector SVG Mark: Stylized Modern Gavel & Dynamic X */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${current.svg} text-white transition-transform duration-300 group-hover:rotate-6`}
        >
          {/* Gavel head angle */}
          <rect
            x="9"
            y="7"
            width="14"
            height="5.5"
            rx="2"
            transform="rotate(-40 9 7)"
            fill="currentColor"
            fillOpacity="0.95"
          />
          {/* Gavel handle extending into dynamic X slash */}
          <path
            d="M13.5 13.5L24 24"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Counter-crossing stroke completing the iconic 'X' */}
          <path
            d="M24 10.5L9.5 25"
            stroke="url(#bidx-accent-grad)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Base impact block / pediment */}
          <rect
            x="5.5"
            y="24.5"
            width="8"
            height="2.5"
            rx="1.25"
            fill="currentColor"
            fillOpacity="0.75"
          />
          <defs>
            <linearGradient
              id="bidx-accent-grad"
              x1="9.5"
              y1="10.5"
              x2="24"
              y2="25"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FDE047" />
              <stop offset="1" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex items-baseline tracking-tight">
          <span
            className={`${current.text} font-black ${
              dark ? "text-white" : "text-gray-900"
            } leading-none`}
          >
            Bid
          </span>
          <span
            className={`${current.text} font-black ${
              dark
                ? "bg-gradient-to-r from-indigo-400 to-violet-300"
                : "bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600"
            } bg-clip-text text-transparent leading-none ml-0.5`}
          >
            X
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-1 mb-0.5 animate-pulse" />
        </div>
      )}
    </div>
  );
};

BidXLogo.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  showWordmark: PropTypes.bool,
  dark: PropTypes.bool,
  className: PropTypes.string,
};

export default BidXLogo;
