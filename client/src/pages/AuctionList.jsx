import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import AuctionCard from "../components/AuctionCard";
import { useGetAuctions } from "../hooks/useAuction";
import LoadingScreen from "../components/LoadingScreen";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const CATEGORIES = [
  "all",
  "Electronics",
  "Antiques",
  "Art",
  "Books",
  "Clothing",
  "Collectibles",
  "Home & Garden",
  "Jewelry",
  "Musical Instruments",
  "Sports",
  "Toys",
  "Vehicles",
  "Other",
];

export const AuctionList = () => {
  useDocumentTitle("Browse Auctions");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("endingSoon");
  const [status, setStatus] = useState("active");
  const navigate = useNavigate();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, isLoading } = useGetAuctions(
    page,
    filter,
    debouncedSearch,
    sortBy,
    status,
  );

  if (isLoading) return <LoadingScreen />;

  const rawData = data || {};
  const auctions = Array.isArray(rawData) ? rawData : rawData.auctions || [];
  const pagination = Array.isArray(rawData) ? {} : rawData.pagination || {};

  const handleCategoryChange = (cat) => {
    setFilter(cat);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition mb-6 group cursor-pointer"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Auctions</h1>
            <p className="text-sm text-gray-400 mt-1">
              Browse {pagination.total || 0} active listings
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Quick Status Filter Tabs */}
            <div className="inline-flex p-1 bg-gray-200/60 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setStatus("active");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  status === "active"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All Active
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatus("endingSoon");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  status === "endingSoon"
                    ? "bg-rose-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-rose-600"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                Ending Soon
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition cursor-pointer shadow-sm"
              aria-label="Sort auctions"
            >
              <option value="endingSoon">⏳ Ending Soonest</option>
              <option value="newest">✨ Newly Listed</option>
              <option value="priceAsc">📈 Price: Low to High</option>
              <option value="priceDesc">📉 Price: High to Low</option>
              <option value="mostBids">🔥 Most Bids</option>
            </select>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search auctions..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition shadow-sm"
              />
              <svg
                className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex flex-nowrap sm:flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filter === category
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-5 flex items-center justify-between text-xs text-gray-400">
          <p>
            Showing {auctions.length} of {pagination.total || 0} listings
            {filter !== "all" && ` in ${filter}`}
            {debouncedSearch && ` matching "${debouncedSearch}"`}
          </p>
          {(filter !== "all" || debouncedSearch) && (
            <button
              type="button"
              onClick={() => {
                setFilter("all");
                setSearchTerm("");
                setPage(1);
              }}
              className="text-indigo-600 hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>

        {auctions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200/80 shadow-sm">
            <svg
              className="w-12 h-12 text-gray-200 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-gray-400">No auctions found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {auctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition ${
                    p === page
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                  }`}
                >
                  {p}
                </button>
              ),
            )}
            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page === pagination.totalPages}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
