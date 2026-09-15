import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router";
import LoadingScreen from "../../components/LoadingScreen";
import {
  getAllMessages,
  updateMessageStatus,
  deleteMessage,
} from "../../services/admin.service.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import toast from "react-hot-toast";
import {
  MdOutlineMail,
  MdOutlineMarkEmailRead,
  MdOutlineMarkEmailUnread,
  MdOutlineDelete,
  MdOutlineSearch,
  MdOutlineReply,
  MdClose,
  MdOutlineFilterList,
} from "react-icons/md";

export const AdminMessages = () => {
  useDocumentTitle("Customer Inquiries | Admin");
  const outletContext = useOutletContext();
  const setUnreadCount = outletContext?.setUnreadCount;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, message: null, deleting: false });

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllMessages(currentPage, searchTerm, statusFilter, 15);
      if (res?.success) {
        setMessages(res.data.messages || []);
        setPagination(res.data.pagination || {});
        if (setUnreadCount && res.data.unreadCount != null) {
          setUnreadCount(res.data.unreadCount);
        }
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load customer messages.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, setUnreadCount]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleToggleStatus = async (msg, e) => {
    e?.stopPropagation();
    const newStatus = msg.status === "unread" ? "read" : "unread";
    try {
      await updateMessageStatus(msg._id, newStatus);
      toast.success(`Message marked as ${newStatus}`);
      fetchMessages();
      if (selectedMessage && selectedMessage._id === msg._id) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.message) return;
    setDeleteModal((prev) => ({ ...prev, deleting: true }));
    try {
      await deleteMessage(deleteModal.message._id);
      toast.success("Message deleted successfully");
      if (selectedMessage?._id === deleteModal.message._id) {
        setSelectedMessage(null);
      }
      setDeleteModal({ open: false, message: null, deleting: false });
      fetchMessages();
    } catch (err) {
      toast.error("Failed to delete message");
      setDeleteModal((prev) => ({ ...prev, deleting: false }));
    }
  };

  const handleRowClick = (msg) => {
    setSelectedMessage(msg);
    if (msg.status === "unread") {
      updateMessageStatus(msg._id, "read")
        .then(() => fetchMessages())
        .catch(() => {});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <MdOutlineMail className="w-6 h-6 text-indigo-600" />
            Customer Inquiries
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Read, respond to, and manage contact requests submitted by users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
            Total Messages: {pagination.totalMessages || 0}
          </span>
        </div>
      </div>

      {/* Filter / Search bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <MdOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search sender, email, or subject..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex rounded-xl bg-gray-100 p-1">
              {[
                { id: "all", label: "All" },
                { id: "unread", label: "Unread" },
                { id: "read", label: "Read" },
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

            <button
              onClick={() => {
                setCurrentPage(1);
                fetchMessages();
              }}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer shadow-xs"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <LoadingScreen />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-500">
            <p className="font-semibold">{error}</p>
            <button
              onClick={fetchMessages}
              className="mt-3 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <MdOutlineMail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-base font-semibold text-gray-700">No inquiries found</p>
            <p className="text-xs text-gray-400 mt-1">Any messages sent via the Contact page will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200/80 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Sender</th>
                  <th className="px-4 py-3.5">Subject & Preview</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {messages.map((msg) => {
                  const isUnread = msg.status === "unread";
                  return (
                    <tr
                      key={msg._id}
                      onClick={() => handleRowClick(msg)}
                      className={`hover:bg-indigo-50/30 transition-colors cursor-pointer ${
                        isUnread ? "bg-indigo-50/15 font-medium" : ""
                      }`}
                    >
                      {/* Status pill */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {isUnread ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            Unread
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
                            Read
                          </span>
                        )}
                      </td>

                      {/* Sender */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div>
                          <p className={`text-sm ${isUnread ? "font-bold text-gray-900" : "text-gray-800"}`}>
                            {msg.name}
                          </p>
                          <p className="text-xs text-gray-400">{msg.email}</p>
                        </div>
                      </td>

                      {/* Subject & Preview */}
                      <td className="px-4 py-3.5 max-w-md">
                        <p className={`text-sm truncate ${isUnread ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                          {msg.subject}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {msg.message}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => handleToggleStatus(msg, e)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                            title={isUnread ? "Mark as Read" : "Mark as Unread"}
                          >
                            {isUnread ? (
                              <MdOutlineMarkEmailRead className="w-4 h-4" />
                            ) : (
                              <MdOutlineMarkEmailUnread className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteModal({ open: true, message: msg, deleting: false });
                            }}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Message"
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
                {Math.min(currentPage * pagination.limit, pagination.totalMessages)}
              </span>{" "}
              of <span className="font-semibold text-gray-900">{pagination.totalMessages}</span>
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

      {/* Message Reader Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    Inquiry Details
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedMessage.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <MdClose className="w-5 h-5" />
              </button>
            </div>

            {/* Sender Info Card */}
            <div className="my-4 p-3.5 rounded-xl bg-gray-50 border border-gray-200/70 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">From</p>
                <p className="text-sm font-semibold text-gray-800">
                  {selectedMessage.name}
                </p>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  {selectedMessage.email}
                </a>
              </div>
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                <MdOutlineReply className="w-4 h-4" />
                Reply
              </a>
            </div>

            {/* Message Body */}
            <div className="py-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Message Content
              </p>
              <div className="p-4 bg-gray-50/60 rounded-xl text-sm text-gray-800 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto border border-gray-100">
                {selectedMessage.message}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handleToggleStatus(selectedMessage)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 transition"
              >
                {selectedMessage.status === "unread" ? (
                  <>
                    <MdOutlineMarkEmailRead className="w-4 h-4" /> Mark as Read
                  </>
                ) : (
                  <>
                    <MdOutlineMarkEmailUnread className="w-4 h-4" /> Mark as Unread
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModal({ open: true, message: selectedMessage, deleting: false });
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Delete Inquiry
            </h3>
            <p className="text-xs text-gray-500">
              Are you sure you want to delete this message from{" "}
              <strong>{deleteModal.message?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                disabled={deleteModal.deleting}
                onClick={() => setDeleteModal({ open: false, message: null, deleting: false })}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteModal.deleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition disabled:opacity-50"
              >
                {deleteModal.deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
