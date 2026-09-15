import { Link } from "react-router";
import {
  usePrefetchHandlers,
  useWatchlist,
  useToggleWatchlist,
} from "../hooks/useAuction.js";
import toast from "react-hot-toast";

export default function AuctionCard({ auction, isWatchlistedProp }) {
  const { prefetchAuction } = usePrefetchHandlers();
  const { data: watchlistData } = useWatchlist();
  const { mutate: toggleWatchlistMutate } = useToggleWatchlist();

  const isFav =
    isWatchlistedProp !== undefined
      ? isWatchlistedProp
      : (watchlistData?.watchlistIds || []).includes(auction._id);

  const handleWatchlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlistMutate(auction._id, {
      onSuccess: (data) => {
        toast.success(
          data?.isWatchlisted ? "Saved to Watchlist!" : "Removed from Watchlist",
          { icon: data?.isWatchlisted ? "❤️" : "🤍", duration: 2500 },
        );
      },
      onError: () => toast.error("Failed to update watchlist"),
    });
  };

  const getTimeBadge = (timeLeftMs) => {
    if (!timeLeftMs || timeLeftMs <= 0) {
      return {
        label: "Ended",
        className: "bg-gray-800/85 text-white",
        urgent: false,
      };
    }

    const minutes = Math.floor(timeLeftMs / (1000 * 60));
    const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
    const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return {
        label: `${Math.max(1, minutes)}m left`,
        className: "bg-rose-600 text-white font-bold shadow-sm shadow-rose-200",
        urgent: true,
      };
    }

    if (hours < 24) {
      return {
        label: `${hours}h left`,
        className: "bg-amber-500/95 text-white font-semibold shadow-sm shadow-amber-200",
        urgent: false,
      };
    }

    return {
      label: `${days}d left`,
      className: "bg-emerald-600/95 text-white shadow-sm",
      urgent: false,
    };
  };

  const timeBadge = getTimeBadge(auction.timeLeft);

  return (
    <Link
      to={`/auction/${auction._id}`}
      viewTransition
      onMouseEnter={() => prefetchAuction(auction._id)}
      className="group block w-full bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-gray-300/80 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-[3/2] overflow-hidden rounded-t-2xl bg-gray-100">
        <img
          src={auction.itemPhoto || "https://picsum.photos/300"}
          alt={auction.itemName}
          className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-indigo-700 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
            {auction.itemCategory}
          </span>
          {auction.bidsCount >= 5 && (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-300/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
              🔥 Hot
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <span
            className={`text-[11px] px-2.5 py-1 rounded-full backdrop-blur-sm ${timeBadge.className}`}
          >
            {timeBadge.label}
          </span>
        </div>

        {/* Watchlist Floating Heart Button */}
        <button
          type="button"
          onClick={handleWatchlistToggle}
          className={`absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 shadow-sm ${
            isFav
              ? "bg-rose-500 text-white shadow-rose-200 scale-105"
              : "bg-white/85 text-gray-400 hover:text-rose-500 hover:bg-white hover:scale-110"
          }`}
          title={isFav ? "Remove from watchlist" : "Add to watchlist"}
          aria-label={isFav ? "Remove from watchlist" : "Add to watchlist"}
        >
          <svg
            className="w-4 h-4 fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-3.5">
        <h3 className="font-semibold text-sm text-gray-900 mb-0.5 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {auction.itemName}
        </h3>
        <p className="text-gray-400 text-[11px] mb-3 line-clamp-1 leading-relaxed">
          {auction.itemDescription}
        </p>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
              Current Bid
            </p>
            <p className="text-lg font-bold text-gray-900 tabular-nums">
              Rs {auction.currentPrice || auction.startingPrice}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {auction.bidsCount} bids
            </span>
          </div>
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">
            by {auction?.sellerName || auction?.seller?.name}
          </p>
          <span className="text-[11px] font-medium text-indigo-500 group-hover:text-indigo-600 transition-colors">
            View &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
