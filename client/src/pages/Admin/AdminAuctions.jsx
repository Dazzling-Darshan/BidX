import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import LoadingScreen from "../../components/LoadingScreen";
import { getAllAdminAuctions, adminDeleteAuction } from "../../services/admin.service.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import toast from "react-hot-toast";
import {
  MdOutlineSearch,
  MdOutlineGavel,
  MdOutlineDelete,
  MdOutlineVisibility,
  MdOutlineFilterList,
  MdClose,
  MdWarningAmber,
} from "react-icons/md";

export const AdminAuctions = () => {
  useDocumentTitle("Auction Moderation | Admin");
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState({ open: false, auction: null, deleting: false });

  const fetchAuctions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllAdminAuctions(
        currentPage,
        searchTerm,
        statusFilter,
        categoryFilter,
        15
      );
      if (res?.success) {
        setAuctions(res.data.auctions || []);
        setPagination(res.data.pagination || {});
      }
    } catch (err) {
      console.error("Error loading admin auctions:", err);
      setError("Failed to load auctions. Please try again.");
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAuctions();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.auction) return;
    setDeleteModal((prev) => ({ ...prev, deleting: true }));
    try {
      await adminDeleteAuction(deleteModal.auction._id);
      toast.success(`Auction "${deleteModal.auction.itemName}" deleted successfully`);
      setDeleteModal({ open: false, auction: null, deleting: false });
      fetchAuctions();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete auction";
      toast.error(msg);
      setDeleteModal((prev) => ({ ...prev, deleting: false }));
    }
  };

  const categories = [
    "all",
    "Electronics",
    "Collectibles",
    "Fashion",
    "Art",
    "Jewelry",
    "Vehicles",
    "Home",
    "Sports",
    "Other",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <MdOutlineGavel className="w-6 h-6 text-indigo-600" />
            Auction Moderation
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor, inspect, and remove active or ended listings across BidX
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
            Total Listings: {pagination.totalAuctions || 0}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <MdOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by item title or description..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex rounded-xl bg-gray-100 p-1">
              {[
                { id: "all", label: "All" },
                { id: "active", label: "Active" },
                { id: "ended", label: "Ended" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(s.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    statusFilter === s.id
                      ? "bg-white text-indigo-600 shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer appearance-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "All Categories" : c}
                  </option>
                ))}
              </select>
              <MdOutlineFilterList className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer shadow-xs"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <LoadingScreen />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-500">
            <p className="font-semibold">{error}</p>
            <button
              onClick={fetchAuctions}
              className="mt-3 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : auctions.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <MdOutlineGavel className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-base font-semibold text-gray-700">No auctions found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search query or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200/80 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Auction Item</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Seller</th>
                  <th className="px-4 py-3.5">Current Price</th>
                  <th className="px-4 py-3.5">Bids</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Ends On</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {auctions.map((auc) => {
                  const isExpired = auc.isExpired;
                  return (
                    <tr key={auc._id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Item Info */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={auc.itemPhoto || "/placeholder.png"}
                            alt={auc.itemName}
                            className="w-11 h-11 rounded-lg object-cover bg-gray-100 shrink-0 border border-gray-200/60"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100";
                            }}
                          />
                          <div className="min-w-0 max-w-xs">
                            <p className="font-semibold text-gray-900 truncate">
                              {auc.itemName}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              ID: {auc._id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {auc.itemCategory}
                        </span>
                      </td>

                      {/* Seller */}
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="font-medium text-gray-900 text-xs">{auc.seller?.name || "Unknown"}</p>
                          <p className="text-[11px] text-gray-400 truncate">{auc.seller?.email || ""}</p>
                        </div>
                      </td>

                      {/* Current Price */}
                      <td className="px-4 py-3.5 font-bold text-gray-900 tabular-nums">
                        Rs {auc.currentPrice}
                      </td>

                      {/* Bids */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                          {auc.bidsCount}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            Ended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live
                          </span>
                        )}
                      </td>

                      {/* End Date */}
                      <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(auc.itemEndDate).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/auction/${auc._id}`}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="View Auction Details"
                          >
                            <MdOutlineVisibility className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteModal({ open: true, auction: auc, deleting: false })}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Auction"
                          >
                            <MdOutlineDelete className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {(currentPage - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-900">
                {Math.min(currentPage * pagination.limit, pagination.totalAuctions)}
              </span>{" "}
              of <span className="font-semibold text-gray-900">{pagination.totalAuctions}</span> auctions
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Previous
              </button>
              <span className="text-xs font-semibold px-2 text-gray-600">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <MdWarningAmber className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900">
                  Delete Listing
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Are you sure you want to delete{" "}
                  <strong className="text-gray-800">
                    &quot;{deleteModal.auction?.itemName}&quot;
                  </strong>
                  ? This will permanently erase the auction, bids, and cloud media.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6">
              <button
                type="button"
                disabled={deleteModal.deleting}
                onClick={() => setDeleteModal({ open: false, auction: null, deleting: false })}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteModal.deleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {deleteModal.deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
